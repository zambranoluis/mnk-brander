"""Exercise real checker failures and accepted links without third-party packages."""

import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
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


class SeparateRootChecks(unittest.TestCase):
    # Reuse fixture helpers without rerunning the legacy cases in this class.
    setUp = DocumentChecks.setUp
    write = DocumentChecks.write
    save_declaration = DocumentChecks.save_declaration
    check_adopted = DocumentChecks.check_adopted

    def setup_split(self):
        self.repo = self.root / 'repo'
        self.base = self.root / 'methods'
        self.write('repo/AGENTS.md', '# Entry\n\n[Home](../studio/README.md)\n'
                   '[Method](../methods/AGENTS.md#scope)\n')
        self.write('methods/AGENTS.md', '# Scope\n')
        self.write('studio/README.md', '# Studio\n\n[Production](PRODUCTION.md)\n')
        self.write('studio/PRODUCTION.md', '# Production\n')
        self.declaration = {
            'version': 2, 'workbase': '../methods', 'workbase_documents': [],
            'workbase_owners': ['AGENTS.md'], 'project_root': '../studio',
            'project_documents': ['README.md', 'PRODUCTION.md'],
            'project_owners': ['README.md', 'PRODUCTION.md'],
        }
        self.save_declaration()

    def test_separate_roots_and_anchors_pass(self):
        self.setup_split()
        self.assertEqual(self.check_adopted(), ([], 3))

    def test_override_changes_only_method_root(self):
        self.setup_split()
        self.write('alternate/AGENTS.md', '# Scope\n')
        self.write('repo/AGENTS.md', '# Entry\n\n[Home](../studio/README.md)\n'
                   '[Method](../alternate/AGENTS.md#scope)\n')
        self.assertEqual(self.check_adopted(workbase=self.root / 'alternate'), ([], 3))

    def test_project_missing_owner_and_missing_root_fail(self):
        self.setup_split()
        (self.root / 'studio/PRODUCTION.md').unlink()
        self.assertTrue(any('missing canonical owner' in e for e in self.check_adopted()[0]))
        self.declaration['project_root'] = '../absent'
        self.save_declaration()
        self.assertTrue(any('project directory does not exist' in e for e in self.check_adopted()[0]))

    def test_project_checked_document_requires_own_allowlist(self):
        self.setup_split()
        self.declaration['project_owners'].remove('PRODUCTION.md')
        self.save_declaration()
        self.assertTrue(any('project_documents must be explicitly listed' in e
                            for e in self.check_adopted()[0]))

    def test_project_declarations_reject_escapes_and_temporary_paths(self):
        self.setup_split()
        for name in ('../methods/AGENTS.md', str(self.repo / 'AGENTS.md'),
                     'workspace/task.md', '%2e%2e/AGENTS.md'):
            with self.subTest(name=name):
                self.declaration['project_owners'] = [name]
                self.save_declaration()
                self.assertTrue(self.check_adopted()[0])

    def test_links_cannot_escape_through_encoding_or_unlisted_owners(self):
        self.setup_split()
        self.write('outside.md', '# Outside\n')
        self.write('studio/other.md', '# Other\n')
        self.write('studio/README.md', '# Studio\n\n[Escape](%2e%2e/outside.md)\n'
                   '[Unlisted](other.md)\n')
        errors, _ = self.check_adopted()
        self.assertEqual(sum('outside repository' in e for e in errors), 2)

    def test_project_symlink_escape_is_rejected(self):
        self.setup_split()
        self.write('outside.md', '# Outside\n')
        try:
            (self.root / 'studio/link.md').symlink_to(self.root / 'outside.md')
        except OSError as error:
            self.skipTest(f'symlink creation unavailable: {error}')
        self.declaration['project_owners'].append('link.md')
        self.save_declaration()
        self.assertTrue(any('invalid canonical owner' in e for e in self.check_adopted()[0]))

    def test_v2_requires_explicit_project_configuration(self):
        self.setup_split()
        for key in ('project_root', 'project_documents', 'project_owners'):
            with self.subTest(key=key):
                saved = self.declaration.pop(key)
                self.save_declaration()
                self.assertTrue(self.check_adopted()[0])
                self.declaration[key] = saved


class IndependentHomeChecks(unittest.TestCase):
    setUp = DocumentChecks.setUp
    write = DocumentChecks.write
    save_declaration = DocumentChecks.save_declaration
    check_adopted = DocumentChecks.check_adopted

    def setup_independent(self):
        self.repo = self.root / 'repo'
        self.write('repo/AGENTS.md', '# Entry\n\n[Home](../studio/README.md#studio)\n')
        self.write('studio/README.md', '# Studio\n\n[Entry](../repo/AGENTS.md#entry)\n')
        self.declaration = {
            'version': 2, 'project_root': '../studio',
            'project_documents': ['README.md'], 'project_owners': ['README.md'],
        }
        self.save_declaration()

    def test_project_only_declaration_checks_both_directions_without_methods(self):
        self.setup_independent()
        self.assertEqual(self.check_adopted(), ([], 2))
        self.write('studio/README.md', '# Renamed\n')
        self.assertTrue(any('missing anchor' in e for e in self.check_adopted()[0]))

    def test_empty_method_lists_do_not_require_a_method_directory(self):
        self.setup_independent()
        self.declaration.update(workbase_owners=[], workbase_documents=[])
        self.save_declaration()
        self.assertEqual(self.check_adopted(), ([], 2))
        self.assertFalse((self.root / 'methods').exists())

    def test_explicit_override_checks_methods_and_keeps_project_root(self):
        self.setup_independent()
        self.write('methods/AGENTS.md', '# Scope\n')
        self.write('repo/AGENTS.md', '# Entry\n\n[Home](../studio/README.md)\n'
                   '[Method](../methods/AGENTS.md#scope)\n')
        self.declaration.update(workbase_owners=['AGENTS.md'], workbase_documents=['AGENTS.md'])
        self.save_declaration()
        self.assertTrue(any('requires a workbase path' in e for e in self.check_adopted()[0]))
        self.assertEqual(self.check_adopted(workbase=self.root / 'methods'), ([], 3))
        self.write('methods/AGENTS.md', '# Scope\n\n[Bad](#missing)\n')
        self.assertTrue(any('missing anchor' in e for e in
                            self.check_adopted(workbase=self.root / 'methods')[0]))

    def test_override_cannot_admit_unlisted_methods_or_change_home(self):
        self.setup_independent()
        self.declaration.update(workbase_owners=[], workbase_documents=[])
        self.save_declaration()
        self.write('methods/other.md', '# Other\n')
        self.write('studio/README.md', '# Studio\n\n[Other](../methods/other.md)\n')
        self.assertTrue(any('outside repository' in e for e in
                            self.check_adopted(workbase=self.root / 'methods')[0]))
        self.assertTrue(any('workbase directory does not exist' in e for e in
                            self.check_adopted(workbase=self.root / 'absent')[0]))
        (self.root / 'studio/README.md').unlink()
        self.assertTrue(any('missing canonical owner' in e for e in
                            self.check_adopted(workbase=self.root / 'methods')[0]))

    def test_optional_method_configuration_never_silently_skips_bad_values(self):
        self.setup_independent()
        for key, value in (('workbase', ''), ('workbase', None),
                           ('workbase', '../absent'), ('workbase_owners', ['AGENTS.md']),
                           ('workbase_documents', ['AGENTS.md']), ('workbase_owners', {}),
                           ('workbase_documents', None)):
            with self.subTest(key=key, value=value):
                self.declaration[key] = value
                self.save_declaration()
                self.assertTrue(self.check_adopted()[0])
                del self.declaration[key]

    def test_legacy_manifest_still_requires_method_path(self):
        self.setup_independent()
        self.declaration['version'] = 1
        self.save_declaration()
        self.assertTrue(any('required in version 1' in e for e in self.check_adopted()[0]))

class StandaloneRepositoryChecks(unittest.TestCase):
    setUp = DocumentChecks.setUp

    def copy_guidance(self):
        # No expected installation names, sibling home or method tree exist.
        self.repo = self.root / 'unrelated/customer-studio'
        declaration = json.loads((ROOT / 'docs-owners.json').read_text(encoding='utf-8'))
        self.assertNotIn('workbase', declaration)
        self.assertEqual(declaration['project_root'], '.')
        for name in (*checker.CANONICAL, *declaration['project_owners'],
                     'docs-owners.json', 'scripts/check_docs.py'):
            target = self.repo / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, target)

    def run_cli(self, *args):
        return subprocess.run([sys.executable, '-B', 'scripts/check_docs.py', *args],
                              cwd=self.repo, capture_output=True, text=True)

    def test_actual_guidance_and_cli_work_without_central_tree(self):
        self.copy_guidance()
        self.assertEqual(checker.check_documents(self.repo, checker.CANONICAL)[0], [])
        result = self.run_cli()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('15 repository + 0 declared external documents; 15 total documents', result.stdout)
        self.assertFalse(any(self.root.rglob('mnk-lab')))

    def test_missing_local_owner_fails_even_without_an_entry_link(self):
        self.copy_guidance()
        (self.repo / 'brands/monolith/BRAND.md').unlink()
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertIn('missing canonical owner brands/monolith/BRAND.md', result.stdout)

    def test_invalid_local_policy_anchor_fails(self):
        self.copy_guidance()
        with (self.repo / 'AGENTS.md').open('a', encoding='utf-8') as stream:
            stream.write('\n[Records](PRODUCTION.md#missing-section)\n')
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertIn('missing anchor PRODUCTION.md#missing-section', result.stdout)

    def test_accidental_external_policy_dependency_fails(self):
        self.copy_guidance()
        external = self.repo.parent / 'external-policy.md'
        external.write_text('# Policy\n', encoding='utf-8')
        with (self.repo / 'PRODUCTION.md').open('a', encoding='utf-8') as stream:
            stream.write('\n[Required policy](../external-policy.md)\n')
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertIn('link outside repository ../external-policy.md', result.stdout)

    def test_local_declared_document_overlap_is_counted_once(self):
        self.copy_guidance()
        expected = checker.check_documents(self.repo, checker.CANONICAL)
        path = self.repo / 'docs-owners.json'
        declaration = json.loads(path.read_text(encoding='utf-8'))
        declaration['project_owners'].append('AGENTS.md')
        declaration['project_documents'].append('AGENTS.md')
        path.write_text(json.dumps(declaration) + '\n', encoding='utf-8')
        result = self.run_cli()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('15 repository + 0 declared external documents; 15 total documents', result.stdout)
        self.assertEqual(checker.check_documents(self.repo, checker.CANONICAL), expected)

    def test_explicit_external_project_mode_reports_actual_locations(self):
        self.copy_guidance()
        external = self.repo.parent / 'legacy-home'
        external.mkdir()
        (external / 'policy.md').write_text('# Policy\n', encoding='utf-8')
        path = self.repo / 'docs-owners.json'
        declaration = json.loads(path.read_text(encoding='utf-8'))
        # Keep six local owners while admitting one explicitly selected external document.
        declaration['project_root'] = '../legacy-home'
        declaration['project_owners'] = ['policy.md']
        declaration['project_documents'] = ['policy.md']
        declaration['workbase'] = '.'
        declaration['workbase_owners'] = json.loads(
            (ROOT / 'docs-owners.json').read_text(encoding='utf-8'))['project_owners']
        declaration['workbase_documents'] = declaration['workbase_owners'].copy()
        path.write_text(json.dumps(declaration) + '\n', encoding='utf-8')
        result = self.run_cli()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('15 repository + 1 declared external documents; 16 total documents', result.stdout)


if __name__ == "__main__":
    unittest.main()
