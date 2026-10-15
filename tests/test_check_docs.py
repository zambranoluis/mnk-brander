"""Exercise real checker failures and accepted links without third-party packages."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("check_docs", ROOT / "scripts/check_docs.py")
checker = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(checker)


class DocumentChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="doc-check-")
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

    def setup_adopted(self):
        # A sibling workbase is deliberately outside the repository boundary.
        self.repo = self.root / 'repo'
        self.base = self.root / 'workbase'
        self.write('repo/AGENTS.md', '# Entry\n\n[Product](../workbase/PRODUCT.md#purpose)\n')
        self.write('workbase/PRODUCT.md', '# Purpose\n\n[Design](DESIGN.md#identity)\n')
        self.write('workbase/DESIGN.md', '# Identity\n')
        self.declaration = {'version': 1, 'workbase': '../workbase',
                            'workbase_documents': ['PRODUCT.md'],
                            'workbase_owners': ['PRODUCT.md', 'DESIGN.md']}
        self.save_declaration()

    def save_declaration(self):
        self.write('repo/docs-owners.json', json.dumps(self.declaration) + '\n')

    def check_adopted(self, **kwargs):
        return checker.check_documents(self.repo, ['AGENTS.md'],
                                       canonical=['AGENTS.md'], **kwargs)

    def test_declared_external_product_and_design_owners_pass(self):
        self.setup_adopted()
        self.assertEqual(self.check_adopted(), ([], 2))
        self.assertEqual(self.check_adopted(workbase=self.base), ([], 2))

    def test_external_owner_missing_anchor_fails(self):
        self.setup_adopted()
        self.write('workbase/PRODUCT.md', '# Renamed\n')
        self.assertTrue(any('missing anchor' in e for e in self.check_adopted()[0]))

    def test_missing_declared_owner_fails_even_if_not_linked(self):
        self.setup_adopted()
        (self.base / 'DESIGN.md').unlink()
        self.assertTrue(any('missing canonical owner' in e for e in self.check_adopted()[0]))

    def test_arbitrary_file_inside_workbase_is_not_allowed(self):
        self.setup_adopted()
        self.write('workbase/other.md', '# Other\n')
        self.write('repo/AGENTS.md', '# Entry\n\n[Other](../workbase/other.md)\n')
        self.assertTrue(any('outside repository' in e for e in self.check_adopted()[0]))

    def test_external_policy_cannot_depend_on_task_records(self):
        self.setup_adopted()
        self.write('workbase/workspace/task.md', '# Task\n')
        self.write('workbase/PRODUCT.md', '# Purpose\n\n[Task](workspace/task.md)\n')
        self.assertTrue(self.check_adopted()[0])
        self.declaration['workbase_owners'].append('workspace/task.md')
        self.save_declaration()
        self.assertTrue(any('invalid canonical owner' in e for e in self.check_adopted()[0]))

    def test_declaration_rejects_escape_and_absolute_paths(self):
        self.setup_adopted()
        for name in ('../repo/AGENTS.md', str(self.repo / 'AGENTS.md')):
            with self.subTest(name=name):
                self.declaration['workbase_owners'] = [name]
                self.save_declaration()
                self.assertTrue(any('invalid canonical owner' in e for e in self.check_adopted()[0]))

    def test_override_does_not_broaden_allowlist(self):
        self.setup_adopted()
        self.assertTrue(self.check_adopted(workbase=self.root / 'absent')[0])
        self.write('alternate/PRODUCT.md', '# Purpose\n')
        self.write('alternate/DESIGN.md', '# Identity\n')
        errors, _ = self.check_adopted(workbase=self.root / 'alternate')
        self.assertTrue(any('outside repository' in e for e in errors))

    def test_undeclared_external_document_cannot_be_checked_as_owner(self):
        self.setup_adopted()
        self.declaration['workbase_documents'].append('DESIGN.md')
        self.declaration['workbase_owners'].remove('DESIGN.md')
        self.save_declaration()
        self.assertTrue(any('explicitly listed' in e for e in self.check_adopted()[0]))

    def test_repo_product_and_design_names_are_accepted(self):
        self.write('AGENTS.md', '# Entry\n\n[Product](PRODUCT.md)\n[Design](DESIGN.md)\n')
        self.write('PRODUCT.md', '# Product\n')
        self.write('DESIGN.md', '# Design\n')
        names = ['AGENTS.md', 'PRODUCT.md', 'DESIGN.md']
        self.assertEqual(checker.check_documents(self.root, names, canonical=names), ([], 2))

    def test_invalid_declaration_shape_and_json_return_errors(self):
        self.setup_adopted()
        for body in ('[]', '{broken', '{"version": 2, "workbase": "../workbase"}'):
            with self.subTest(body=body):
                self.write('repo/docs-owners.json', body)
                errors, _ = self.check_adopted()
                self.assertTrue(any('canonical declaration' in e for e in errors))


if __name__ == "__main__":
    unittest.main()
