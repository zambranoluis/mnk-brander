"""Check the current canonical chain; historical template records are out of scope."""

import argparse
import json
from collections import Counter
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
CANONICAL = (
    "AGENTS.md", "README.md", "AGENTS/workflows/COMMERCIAL-WORKFLOW.md",
    "AGENTS/workflows/CREATIVE-DEVELOPMENT.md",
    "AGENTS/docs/VERIFICATIONS.md", "AGENTS/docs/INVESTIGATIONS.md",
    "AGENTS/docs/PLANS.md", "AGENTS/docs/IMPLEMENTATIONS.md",
    "AGENTS/docs/INSTRUCTIONS_MAKER.md",
)
RETIRED = re.compile(
    r"\b(?:CODE|FRONTEND_CREATION|ADOPTION)\.md"
    r"|\bImpeccable\b|unconfigured starter", re.IGNORECASE
)
TEMPORARY = {'workspace', 'archive', 'archives', 'local', 'memories', '.codex'}


def declared_workbase(root, override=None):
    """Load exact owner paths; a workbase directory alone grants no link access."""
    declaration = root / 'docs-owners.json'
    if not declaration.exists():
        if override is not None:
            raise ValueError('--workbase requires docs-owners.json')
        return set(), []
    data = json.loads(declaration.read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('version') != 1 or not isinstance(data.get('workbase'), str):
        raise ValueError('docs-owners.json requires version 1 and a workbase path')
    base = Path(override) if override is not None else root / data['workbase']
    base = base.resolve()
    if not base.is_dir():
        raise ValueError(f'workbase directory does not exist: {base}')

    def paths(key):
        names = data.get(key)
        if not isinstance(names, list) or any(not isinstance(n, str) for n in names):
            raise ValueError(f'{key} must be a list of relative document paths')
        result = []
        for name in names:
            relative = Path(name)
            dest = (base / relative).resolve()
            if (relative.is_absolute() or '..' in relative.parts
                    or not dest.is_relative_to(base) or dest.suffix.lower() != '.md'
                    or TEMPORARY.intersection(p.lower() for p in relative.parts)):
                raise ValueError(f'{key}: invalid canonical owner {name}')
            # Also inspect the resolved path: a symlink cannot disguise scratch as policy.
            if TEMPORARY.intersection(p.lower() for p in dest.relative_to(base).parts):
                raise ValueError(f'{key}: temporary canonical owner {name}')
            if not dest.is_file():
                raise ValueError(f'{key}: missing canonical owner {name}')
            result.append(dest)
        return result

    owners = set(paths('workbase_owners'))
    documents = paths('workbase_documents')
    if not set(documents) <= owners:
        raise ValueError('workbase_documents must be explicitly listed in workbase_owners')
    return owners, documents


def prose(body):
    """Ignore fenced examples for heading/link checks, preserving line numbers."""
    lines = []
    fence = None
    for line in body.splitlines():
        match = re.match(r"\s*(`{3,}|~{3,})", line)
        if match:
            token = match.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            lines.append("")
        else:
            lines.append(line if fence is None else "")
    return "\n".join(lines)


def anchors(body):
    counts = Counter()
    result = set()
    for heading in re.findall(r"^#{1,6}\s+(.+?)\s*#*\s*$", prose(body), re.M):
        slug = re.sub(r"[^\w\- ]", "", heading.lower()).replace(" ", "-")
        occurrence = counts[slug]
        counts[slug] += 1
        result.add(slug if occurrence == 0 else f"{slug}-{occurrence}")
    return result


def check_documents(root, files, canonical=CANONICAL, workbase=None):
    """Return errors and local-link count. Do not fetch URLs or mutate files."""
    root = Path(root).resolve()
    canonical_paths = {(root / name).resolve() for name in canonical}
    try:
        external_owners, external_documents = declared_workbase(root, workbase)
    except (OSError, ValueError, TypeError) as error:
        return [f'canonical declaration: {error}'], 0
    canonical_paths.update(external_owners)
    errors = []
    link_count = 0
    for name in dict.fromkeys([*files, *external_documents]):
        path = (root / name).resolve()
        if not path.is_relative_to(root) and path not in external_documents:
            errors.append(f"{name}: document outside repository")
            continue
        if not path.is_file():
            errors.append(f"{name}: missing document")
            continue
        try:
            body = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as error:
            errors.append(f"{name}: unreadable document ({type(error).__name__})")
            continue
        if not body.endswith("\n") or body.endswith("\n\n"):
            errors.append(f"{name}: require one final newline")
        for number, line in enumerate(body.splitlines(), 1):
            if line.rstrip() != line or "\t" in line:
                errors.append(f"{name}:{number}: trailing whitespace or tab")
        active = prose(body)
        if path in canonical_paths and path.is_relative_to(root) and RETIRED.search(active):
            errors.append(f"{name}: retired routing or template language")
        for target in re.findall(r"\]\(([^)]+)\)", active):
            target = target.strip().removeprefix("<").removesuffix(">")
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc:
                if path in canonical_paths and (
                    parsed.scheme.lower() not in {"https", "http", "mailto"}
                    or parsed.netloc.startswith("localhost")
                    or parsed.netloc.startswith("127.0.0.1")
                ):
                    errors.append(f"{name}: machine-local or unsupported link {target}")
                continue
            link_count += 1
            resolved = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if not resolved.is_relative_to(root) and resolved not in external_owners:
                errors.append(f"{name}: link outside repository {target}")
                continue
            if path in canonical_paths and resolved not in canonical_paths:
                errors.append(f"{name}: canonical rule depends on noncanonical file {target}")
            if not resolved.is_file():
                errors.append(f"{name}: missing link target {target}")
            elif parsed.fragment:
                try:
                    target_body = resolved.read_text(encoding="utf-8")
                except (OSError, UnicodeError) as error:
                    errors.append(f"{name}: unreadable heading target ({type(error).__name__})")
                    continue
                if unquote(parsed.fragment) not in anchors(target_body):
                    errors.append(f"{name}: missing anchor {target}")
    return errors, link_count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--record", action="append", default=[],
                        help="also check Markdown in a current work-item directory")
    parser.add_argument('--workbase', type=Path,
                        help='override the declared workbase location; exact owner allowlist still applies')
    args = parser.parse_args()
    files = list(CANONICAL)
    for supplied in args.record:
        directory = (ROOT / supplied).resolve()
        if not directory.is_relative_to(ROOT / "workspace") or not directory.is_dir():
            parser.error("--record requires an existing repository-local workspace directory")
        files.extend(str(path.relative_to(ROOT)) for path in sorted(directory.rglob("*.md")))
    files = list(dict.fromkeys(files))
    errors, link_count = check_documents(ROOT, files, workbase=args.workbase)
    if errors:
        print("\n".join(errors))
        return 1
    _, home_documents = declared_workbase(ROOT, args.workbase)
    print(f"PASS: {len(CANONICAL)} repository + {len(home_documents)} workbase documents; "
          f"{len(files) + len(home_documents)} total documents; "
          f"{link_count} local links/anchors; formatting and canonical independence.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
