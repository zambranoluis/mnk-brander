# Studio engineering and verification

## Documentation checks

Python 3.10+ and Git support the existing source checker without third-party packages. Run from the mnk-brander source root:

```powershell
python -B scripts/check_docs.py
python -B -m unittest discover -s tests -p test_check_docs.py -v
git diff --check
git status --short
```

`docs-owners.json` is the tooling configuration. Its version-2 declaration uses `project_root: "."` and checks the nine repository entry/method documents plus six local studio/brand owners. Every declared owner must exist, checked documents must be subsets of owner lists, and invalid anchors, path escapes and temporary-policy dependencies fail. Default checks require only this repository; output counts unique documents by their actual local or external location. Production history is outside this default policy check.

Explicit version-2 external `project_root` declarations remain supported for legacy callers. Optional `workbase`, `workbase_documents` and `workbase_owners` select method documents: a declared path must exist; without a path, absent/empty method lists are valid, while nonempty lists require a path or `--workbase`. The override changes only the method root and keeps exact allowlists and the project root. With the default empty method lists it validates the supplied directory but checks no method documents. Version-1 manifests retain their required single method root and override behavior. No schema change is required.

Focused tests exercise legacy/separate roots, optional methods, override boundaries, accurate local/external counts, and the real canonical guidance/checker copied into an unrelated directory without mnk-lab. Missing local owners, invalid anchors and accidental external policy links are rejected. Official documentation and explicitly selected product sources remain factual references, never substitutes for local operative policy. Static/CLI fixtures do not prove observed agent behavior or host loading.

For base-led context maintenance, run `python -B scripts/work.py check --scope project --project mnk-brander` from the selected method root. The descriptor keeps one central home entry and routes requirement roles to repository owners; local methods remain conditional independent-use routes. For shared method documentation changes run `python -B scripts/work.py check --scope core`; shared executable helper changes require the selected base's helper regression suite. Package checks apply to package changes or suspected drift. The retained OpenJM PRODUCT/DESIGN documents are conditional factual source reads outside the checked policy set because their inherited implementation-layer link is unavailable here; no checker pass certifies that reference.

## Conditional production checks

From source, `python -B scripts/check_commercial_project.py <selected-package-root>` inspects supported HTML/CSS and known JSON references. It is neither a universal dependency scanner nor a renderer. Establish actual commands, pinned runtime and prerequisites from the selected editable source package before production. No studio-wide application build, renderer or provider has been selected.

For a dependency-free HTML study, serve its directory using `python -B -m http.server <free-port> --bind 127.0.0.1 --directory <study-directory>`. Inspect rendered wide/narrow layouts, reachable states, keyboard/focus, overflow and recovery with an available browser. SVG source needs rendered monochrome, reversed and small-size review. Static web/native compositions remain unimplemented concepts; browser evidence does not establish native-device behavior.

## Unavailable production prerequisites

- No complete editable film source package, package/runtime manifest, reusable tools, production resume record or build environment were found in the current source workspace. Retained MP4/PNG/GLB files and supplied audio remain preserved; they do not establish an editable or reproducible delivery. The owner of a requested film revision must supply or identify its source package and selected baseline before dependent editing.
- `tests/test_openjm_reusable.py` imports `workspace/openjm-boy-homework/tools/project.py`, `build_graph.py` and `commercial.py`; these paths are absent. The full production suite is unavailable. Focused documentation tests do not repair or certify it. No replacement is guessed.
- Retained OpenJM PRODUCT links to an implementation-layer map relative to its original product context; that map is absent here. For executable claims resolve the relevant registered OpenJM product home and inspect its current contracts. Do not silently relabel the retained document as a current runtime specification.
- Model/provider access, generation rights, credits, human listening/visual approval and audience effectiveness are unverified. Confirm prerequisites only when the task requires them. No installation, upload or provider changes follow from assimilation.

[PRODUCTION](PRODUCTION.md) owns general delivery states and [COMMERCIAL](COMMERCIAL.md) owns film-specific verification. Document passes establish declared structural integrity, not production accuracy, host loading or design quality.
