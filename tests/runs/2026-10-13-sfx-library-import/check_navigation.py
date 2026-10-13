"""Validate current navigation separately from unchanged historical references."""
from import_verify import A, C, E, ROOT, S, T, read, save, sha
from collections import Counter
import csv
import importlib.util
import json

spec=importlib.util.spec_from_file_location('docs',ROOT/'scripts/check_docs.py')
docs=importlib.util.module_from_spec(spec)
spec.loader.exec_module(docs)
files=[p.relative_to(ROOT).as_posix() for p in [C/'README.md',C/'openjm-boy-homework-commercial.md',
                                              T/'README.md',T/'LIBRARY-GUIDE.md']]
# The report is itself a navigation target. Reserve a new task-owned file before checking.
save(E/'navigation.json',{'status':'checking'})
errors,count=docs.check_documents(ROOT,files)
canonical_errors,canonical_count=docs.check_documents(ROOT,docs.CANONICAL)
historical=read(E/'historical-links.json')
for link in historical:
    if link['mapped_destination']:
        assert (C/link['mapped_destination']).is_file(),link
inventory=read(T/'import-inventory.json')
actual={p.relative_to(C).as_posix() for base in [A,S] for p in base.rglob('*') if p.is_file()}
assert actual=={r['destination'] for r in inventory}
assert not any(p.suffix in {'.mp4','.m4a','.zip','.pyc'} for base in [A,S] for p in base.rglob('*') if p.is_file())
for r in inventory:
    assert sha(C/r['destination'])==r['sha256']
manifest=read(S/'sfx-cues.json')['cues']
with (T/'historical-cues.csv').open(encoding='utf-8',newline='') as f:
    exported=list(csv.DictReader(f))
assert len(exported)==len(manifest)==117
for source,row in zip(manifest,exported):
    assert all(row[k]==str(v) for k,v in source.items()),source['id']
    assert (C/row['imported_asset']).is_file()
preserved=read(E/'preservation-before.json')
changed=[p for p,digest in preserved.items() if not (ROOT/p).is_file() or sha(ROOT/p)!=digest]
assert set(changed)=={'workspace/openjm-boy-homework/README.md','workspace/openjm-boy-homework/openjm-boy-homework-commercial.md'}
report=dict(status='passed' if not errors+canonical_errors else 'failed',current_documents=files,
            current_local_links=count,errors=errors,canonical_documents=len(docs.CANONICAL),
            canonical_links=canonical_count,canonical_errors=canonical_errors,
            historical_links_classified=len(historical),historical_classifications=dict(Counter(r['classification'] for r in historical)),
            imported_file_set_exact=True,cue_csv_values_match_manifest=117,
            preservation_rechecked=len(preserved),changed_current_documents=changed,
            scope='Current Markdown links/anchors and formatting only; historical files remain unchanged and are classified separately. No web links fetched.')
(E/'navigation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
assert not errors+canonical_errors
