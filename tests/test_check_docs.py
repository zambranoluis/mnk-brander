"""Exercise real checker failures and accepted links without third-party packages."""

import importlib.util
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("check_docs", ROOT / "scripts/check_docs.py")
checker = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(checker)


class DocumentChecks(unittest.TestCase):
    def setUp(self):
        scratch = ROOT / "workspace/commercial-preparation-system/local"
        scratch.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix="doc-check-", dir=scratch)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def write(self, name, body):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8")

    def check(self):
        return checker.check_documents(self.root, ["AGENTS.md", "guide.md"],
                                       canonical=["AGENTS.md", "guide.md"])

    def test_valid_anchors_encoded_path_and_external_source(self):
        self.write("AGENTS.md", "# Entry\n\n[Guide](guide.md#repeat-1)\n"
                   "[Source](https://example.com/source)\n")
        self.write("guide.md", "# Repeat\n\n# Repeat\n\n[Entry](AGENTS%2Emd#entry)\n")
        self.assertEqual(self.check(), ([], 2))

    def test_missing_file_and_anchor_are_rejected(self):
        self.write("AGENTS.md", "# Entry\n\n[Absent](missing.md)\n[Wrong](guide.md#wrong)\n")
        self.write("guide.md", "# Guide\n")
        errors, _ = self.check()
        self.assertTrue(any("missing link target missing.md" in item for item in errors))
        self.assertTrue(any("missing anchor guide.md#wrong" in item for item in errors))

    def test_retired_routing_and_workspace_dependency_are_rejected(self):
        self.write("AGENTS.md", "# Entry\n\n[Old](CODE.md)\n[History](workspace/history.md)\n")
        self.write("guide.md", "# Guide\n")
        self.write("workspace/history.md", "# History\n")
        errors, _ = self.check()
        self.assertTrue(any("retired routing" in item for item in errors))
        self.assertTrue(any("depends on noncanonical file" in item for item in errors))

    def test_fenced_examples_do_not_create_links_or_retired_routing(self):
        self.write("AGENTS.md", "# Entry\n\n```text\n[Example](CODE.md)\n```\n")
        self.write("guide.md", "# Guide\n")
        self.assertEqual(self.check(), ([], 0))

    def test_formatting_and_missing_document_are_rejected(self):
        self.write("AGENTS.md", "# Entry \n\ttext\n\n")
        errors, _ = self.check()
        self.assertTrue(any("require one final newline" in item for item in errors))
        self.assertTrue(any("trailing whitespace or tab" in item for item in errors))
        self.assertTrue(any("missing document" in item for item in errors))

    def test_external_files_and_machine_local_links_are_rejected(self):
        self.write("AGENTS.md", "# Entry\n\n[Escape](../outside.md)\n"
                   "[Local](C:/private/source.md)\n[Localhost](http://localhost:3000/)\n")
        self.write("guide.md", "# Guide\n")
        errors, _ = self.check()
        self.assertTrue(any("outside repository" in item for item in errors))
        self.assertEqual(sum("machine-local" in item for item in errors), 2)


if __name__ == "__main__":
    unittest.main()
