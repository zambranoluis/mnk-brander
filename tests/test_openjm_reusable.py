"""Focused graph/path/package behavior using disposable commercial fixtures."""
from pathlib import Path
import copy,json,shutil,sys,tempfile,unittest,zipfile
from unittest.mock import patch
TOOLS=Path(__file__).resolve().parents[1]/'workspace/openjm-boy-homework/tools'
sys.path.insert(0,str(TOOLS))
from project import Project,write,read
from build_graph import Graph
from commercial import package,deliver

class ReusableBuild(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        def file(rel,value=b'fixture'):
            p=self.root/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(value);return p
        self.file=file
        for name in ['base_audio.py','picture.py','media.py','project.py','build_graph.py','capture.cjs']:
            file('tools/'+name,(TOOLS/name).read_bytes())
        for n in ['package.json','package-lock.json','hyperframes.json']:file(n,b'{}')
        file('requirements.txt',b'');file('assets/preview-runtime/gsap.min.js')
        write(self.root/'assets/audio-v002/input-manifest.json',{'originals':[{'filename':'N01.mp3'}]})
        write(self.root/'assets/audio-v002/build-settings.json',{'sample_rate':48000,'originals':'assets/audio-v002/originals','manifest':'assets/audio-v002/input-manifest.json','prepared':'assets/audio-v002/derived'})
        write(self.root/'assets/audio-v002/mix-settings.json',{})
        for n in ['N01-48k.wav','narration-timeline.wav','instrumental-timeline.wav','song-timeline.wav']:file('assets/audio-v002/derived/'+n)
        file('assets/audio-v002/originals/N01.mp3');file('output/openjm-audio-v002-mix.wav')
        write(self.root/'formats/timing.json',{'fps':25,'totalFrames':10,'slots':[{'id':'text','durationFrames':10,'startFrame':0,'sourceInFrame':0,'track':0}],'transitions':[]})
        for fmt,w,h in [('landscape',16,9),('portrait',9,16)]:
            file(f'sources/{fmt}/index.html',b'<link rel="stylesheet" href="scene.css">');file(f'sources/{fmt}/scene.css',b'body { color: red }')
            for n in ['picture','movie','mix','preview','scene']:file(f'output/{fmt}-{n}.mp4')
            write(self.root/f'formats/{fmt}.json',{'width':w,'height':h,'timing':'formats/timing.json','sample_rate':48000,'scenes':{'text':{'kind':'ui','entry':f'sources/{fmt}/index.html','retained':f'output/{fmt}-scene.mp4','viewport':{'width':w,'height':h},'scale':1}},'audio':{'kind':'base','base_settings':'assets/audio-v002/build-settings.json'},'baseline':{n:f'output/{fmt}-{n}.mp4' for n in ['picture','movie','mix','preview']}})
        write(self.root/'revisions/check/project.json',{'revision':'check','targets':['landscape','portrait'],'overrides':{}})
        self.p=Project(self.root,'check','both');self.g=Graph(self.p);self.g.seed_retained()
    def tearDown(self):self.temp.cleanup()
    def dirty(self,g=None,force=()):return {r['stage'] for r in (g or Graph(self.p)).plan(force) if r['operation']=='build'}
    def test_unchanged_and_missing_cache(self):
        self.assertEqual(self.dirty(),set());self.g.state_path.unlink();self.assertEqual(self.dirty(),set())
        self.g.shared_state_path.unlink();self.assertEqual(len(self.dirty()),len(self.g.nodes))
    def test_audio_change_reuses_every_scene_and_assembly(self):
        self.file('assets/audio-v002/originals/N01.mp3',b'changed')
        dirty=self.dirty();self.assertEqual({k for k in dirty if not k.startswith('base-')},{'landscape:mux','portrait:mux'})
        self.assertEqual(len(dirty),4)
    def test_one_scene_and_format_isolation(self):
        self.file('sources/portrait/scene.css',b'body { color: blue }')
        self.assertEqual(self.dirty(),{'portrait:scene:text','portrait:assembly','portrait:mux'})
        self.assertEqual(self.dirty(Graph(Project(self.root,'check','landscape'))),set())
    def test_file_override_does_not_copy_shared_assets(self):
        self.file('revisions/check/changed.css',b'body { color: blue }')
        cfg=read(self.p.task_dir/'project.json');cfg['overrides']={'portrait':{'scenes':{'text':{'files':{'sources/portrait/scene.css':'revisions/check/changed.css'}}}}};write(self.p.task_dir/'project.json',cfg)
        g=Graph(Project(self.root,'check','both'));n=g.nodes['portrait:scene:text']
        self.assertIn('revisions/check/changed.css',n['inputs']);self.assertNotIn('sources/portrait/scene.css',n['inputs']);self.assertEqual(self.dirty(g),{'portrait:scene:text','portrait:assembly','portrait:mux'})
    def test_declared_dynamic_assets_are_required_and_packaged(self):
        self.file('assets/dynamic.png',b'image')
        cfg=read(self.root/'formats/landscape.json');cfg['scenes']['text']['dependencies']=['assets/dynamic.png'];write(self.root/'formats/landscape.json',cfg)
        g=Graph(Project(self.root,'check','landscape'));out=self.root/'output/packages/dynamic.zip';package(g,out)
        with zipfile.ZipFile(out) as z:self.assertEqual(z.read('assets/dynamic.png'),b'image')
        (self.root/'assets/dynamic.png').unlink()
        with self.assertRaises(FileNotFoundError):Graph(Project(self.root,'check','landscape'))
    def test_stale_output_and_tool(self):
        self.file('output/portrait-scene.mp4',b'corrupt')
        self.assertEqual(self.dirty(),{'portrait:scene:text','portrait:assembly','portrait:mux'})
        self.file('tools/media.py',b'changed')
        self.assertIn('landscape:mux',self.dirty())
    def test_missing_dependency_fails_before_writes(self):
        (self.root/'assets/audio-v002/originals/N01.mp3').unlink()
        with self.assertRaises(FileNotFoundError):Graph(self.p)
        self.assertFalse(self.p.generated.exists())
    def test_missing_static_scene_reference_fails_early(self):
        (self.root/'sources/portrait/scene.css').unlink()
        with self.assertRaises(FileNotFoundError):Graph(self.p)
    def test_force_selected_stage_and_actual_execution_order(self):
        expected=['portrait:scene:text','portrait:assembly','portrait:mux'];executed=[]
        def execute(n,outputs):
            executed.append(n['key'])
            for value in outputs.values():value.write_bytes(b'new result')
        with patch.object(self.g,'execute',side_effect=execute):self.g.run(['portrait:scene:text'])
        self.assertEqual(executed,expected);self.assertEqual(self.dirty(),set())
        with self.assertRaises(ValueError):self.g.plan(['unknown'])
    def test_protected_paths_and_target_declaration(self):
        for path in ['../assets/a','/absolute','C:/a','portrait/../../file','x\\bad']:
            with self.subTest(path=path),self.assertRaises(ValueError):self.p.output(path)
        with self.assertRaises(ValueError):self.p.input('../outside')
        with self.assertRaises(ValueError):self.p.input('revisions/other/secret')
        with self.assertRaises(ValueError):Project(self.root,'../other','portrait')
        cfg=read(self.p.task_dir/'project.json');cfg['targets']=['portrait'];write(self.p.task_dir/'project.json',cfg)
        with self.assertRaises(ValueError):Project(self.root,'check','both')
    def test_overwrite_refusal_delivery_and_package(self):
        deliver(self.g,'candidate');before=(self.root/'output/candidate-portrait.mp4').read_bytes()
        with self.assertRaises(FileExistsError):deliver(self.g,'candidate')
        self.assertEqual((self.root/'output/candidate-portrait.mp4').read_bytes(),before)
        g=Graph(Project(self.root,'check','landscape'));out=self.root/'output/packages/test.zip';package(g,out)
        with self.assertRaises(FileExistsError):package(g,out)
        with self.assertRaises(ValueError):package(g,self.root/'assets/test.zip')
        with zipfile.ZipFile(out) as z:
            self.assertFalse(any('portrait' in n for n in z.namelist()));z.extractall(self.root/'local/package')
        isolated=Graph(Project(self.root/'local/package','check','landscape'));self.assertEqual(self.dirty(isolated),set())
    def test_interrupted_build_invalidates_success_record(self):
        with patch.object(self.g,'execute',side_effect=RuntimeError('interrupted')):
            with self.assertRaises(RuntimeError):self.g.run(['portrait:scene:text'])
        self.assertIn('portrait:scene:text',self.dirty())
    def test_bounded_stage_build_invalidates_dependent_assembly(self):
        def execute(n,outputs):
            for value in outputs.values():value.write_bytes(b'changed rendered bytes')
        with patch.object(self.g,'execute',side_effect=execute):self.g.run(['portrait:scene:text'],['portrait:scene:text'])
        self.assertEqual(self.dirty(),{'portrait:assembly','portrait:mux'})
if __name__=='__main__':unittest.main()
