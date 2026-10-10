"""Check the current canonical chain; historical template records are out of scope."""

import argparse
from collections import Counter
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
CANONICAL = (
    "AGENTS.md", "README.md", "COMMERCIAL-WORKFLOW.md",
    "AGENTS/docs/VERIFICATIONS.md", "AGENTS/docs/INVESTIGATIONS.md",
    "AGENTS/docs/PLANS.md", "AGENTS/docs/IMPLEMENTATIONS.md",
    "AGENTS/docs/INSTRUCTIONS_MAKER.md",
)
RETIRED = re.compile(
    r"\b(?:CODE|PRODUCT|DESIGN|FRONTEND_CREATION|ADOPTION)\.md"
    r"|\bImpeccable\b|unconfigured starter", re.IGNORECASE
)


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


def check_documents(root, files, canonical=CANONICAL):
    """Return errors and local-link count. Do not fetch URLs or mutate files."""
    root = Path(root).resolve()
    canonical_paths = {(root / name).resolve() for name in canonical}
    errors = []
    link_count = 0
    for name in files:
        path = (root / name).resolve()
        if not path.is_relative_to(root):
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
        if path in canonical_paths and RETIRED.search(active):
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
            if not resolved.is_relative_to(root):
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
    args = parser.parse_args()
    files = list(CANONICAL)
    for supplied in args.record:
        directory = (ROOT / supplied).resolve()
        if not directory.is_relative_to(ROOT / "workspace") or not directory.is_dir():
            parser.error("--record requires an existing repository-local workspace directory")
        files.extend(str(path.relative_to(ROOT)) for path in sorted(directory.rglob("*.md")))
    files = list(dict.fromkeys(files))
    errors, link_count = check_documents(ROOT, files)
    if errors:
        print("\n".join(errors))
        return 1
    print(f"PASS: {len(CANONICAL)} canonical documents; {len(files)} total documents; "
          f"{link_count} local links/anchors; formatting and canonical independence.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
