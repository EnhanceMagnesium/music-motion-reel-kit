import json,csv,os,subprocess
from pathlib import Path
kit=Path(__file__).resolve().parent.parent;p=kit/'repository-preparation';rs=[r for r in json.loads((kit/'source-library/import-ledger.json').read_text()) if r['kind']=='repository'];integrity={r['id']:r for r in json.loads((p/'CHECKOUT_INTEGRITY.json').read_text())}
reports={n:json.loads((p/n).read_text()) for n in ['R01_R03_DEPENDENCIES.json','R04_R07_DEPENDENCIES.json','R05_R13_DEPENDENCIES.json']}
repo_status={r['id']:r.get('status','prepared; see capability/check records') for n,d in reports.items() for r in d.get('repositories',[])}
repo_status.update({'R01':'p5/p5.brush/Puppeteer installed; resolution and existing Chrome launch checked','R02':'kinetic and painted templates installed; module resolution and Chrome launch checked','R03':'shared Node/Python core and paper-popup installed; representative demo dependency resolution checked','R04':'filtered local workspace installed; core/engine/producer/player/studio/CLI built and imports checked','R07':'app dependencies installed; compile checked without omitted soundtrack copying'})
entry={r['id']:r.get('entryPaths', [r.get('capabilities',{}).get('entry','')]) for n,d in reports.items() for r in d.get('repositories',[])}
entry.update({'R01':['render.mjs','studio.html','src/core.js'],'R02':['skills/kinetic-reel/template/render.mjs','skills/painted-animation/template/render.mjs'],'R03':['core/render/video.mjs','core/render/browser.mjs','styles/paper-popup/demo/index.html','styles/risograph/demo/riso.js','styles/engraving/demo/engine/burin.js']})
def size(root):
 logical=allocated=0
 for d,ds,fs in os.walk(root,followlinks=False):
  ds[:]=[n for n in ds if not Path(d,n).is_symlink()]
  for f in fs:
   q=Path(d,f)
   if q.is_symlink():continue
   s=q.stat();logical+=s.st_size;allocated+=s.st_blocks*512
 return logical,allocated
rows=[];storage=[]
for r in rs:
 root=kit/'repository-downloads'/r['resolved_url'].removeprefix('https://github.com/');i=integrity[r['id']];git_size=size(root/'.git');dep_dirs=[]
 for d,ds,fs in os.walk(root,followlinks=False):
  ds[:]=[n for n in ds if n!='.git' and not Path(d,n).is_symlink()]
  for n in list(ds):
   if n in ['node_modules','.venv']:
    dep_dirs.append(Path(d,n));ds.remove(n)
 dep_sizes=[size(x) for x in dep_dirs];tracked=subprocess.run(['git','status','--porcelain','--untracked-files=no'],cwd=root,capture_output=True,text=True).stdout.strip()
 report={'R01':'R01_R03','R02':'R01_R03','R03':'R01_R03','R04':'R04_R07','R07':'R04_R07'}.get(r['id'],'R05_R13')+'_DEPENDENCIES.json'
 rows.append({'repo_id':r['id'],'repository_url':r['input_url'],'resolved_url':r['resolved_url'],'commit':r['commit'],'local_path':str(root),'download_status':i['status'],'tracked_entries_verified':i['verified_entries'],'lfs_files_verified':i['lfs_entries'],'source_media_bytes':i['working_content_bytes'],'git_metadata_file_bytes':git_size[0],'installed_dependency_file_bytes':sum(x[0] for x in dep_sizes),'dependency_directory_count':len(dep_dirs),'preparation_status':repo_status.get(r['id'],'see detail report'),'entry_points':'; '.join(entry.get(r['id'],[])),'license_record':r['observed_license'],'approved_role':r['role'],'tracked_files_unchanged':not bool(tracked),'detail_report':str(p/report),'visual_review':'not performed'})
 storage.append({'repo_id':r['id'],'source_media_bytes':i['working_content_bytes'],'git_metadata_logical_bytes':git_size[0],'git_metadata_allocated_bytes':git_size[1],'installed_dependencies_logical_bytes':sum(x[0] for x in dep_sizes),'installed_dependencies_allocated_bytes':sum(x[1] for x in dep_sizes),'dependency_paths':[str(x) for x in dep_dirs]})
with (p/'REPOSITORY_LIBRARY_CATALOG.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
(p/'STORAGE_BREAKDOWN.json').write_text(json.dumps(storage,indent=2))
# Per-project dependency matrix, including retained deferred manifests.
inventory=list(csv.DictReader((p/'DEPENDENCY_PROJECT_INVENTORY.csv').open()));matrix=[]
for x in inventory:
 rid=x['repo_id'];rel=x['manifest'];status='deferred subproject; requirements inventoried';cmd='';verify='not run for this subproject';runtime=x['runtime_requirements'];cap={'R01':'illustrated character drawing and p5.brush rendering','R02':'painted or kinetic music-film template','R03':'shared browser/material renderer or selected style demo','R04':'HTML animation workspace: '+rel,'R05':'local p5/Python/Swift music-video tooling or optional orchestration','R06':'native Canvas film engine and drawing/effects helpers','R07':'Three/WebGL song-feature engine','R08':'illustrated film architecture study','R09':'browser-native genre animation study; website build optional','R10':'cinematic WebGL film study and Playwright export tools','R11':'animation-source discovery catalog','R12':'video/prompt discovery catalog','R13':'video/style/source discovery catalog'}.get(rid,'source project')
 if rid in ['R01','R02']:
  status='installed';cmd='npm ci --ignore-scripts' if 'package-lock.json' in x['lockfiles'] else 'npm install --ignore-scripts --package-lock=false';verify='module resolution checked; browser launcher checked';runtime='Node 26.7.0; Chrome 154'
 elif rid=='R03':
  if rel=='package.json':status='installed';cmd='npm ci --ignore-scripts';verify='module resolution and Chrome launcher checked';runtime='Node 26.7.0'
  elif rel=='requirements.txt':status='installed in isolated .venv';cmd='uv pip install --python .venv/bin/python -r requirements.txt';verify='NumPy/SciPy/SoundFile/soxr/Pillow imports checked';runtime='Python 3.12.13'
  elif rel=='styles/paper-popup/demo/package.json':status='installed local demo dependencies';cmd='npm ci --ignore-scripts';verify='Three and browser package resolution checked';runtime='Node 26.7.0'
  elif rel.endswith('package.json'):status='resolved through ancestor root installation';cmd='no additional installation needed';verify='declared playwright-core resolution checked';runtime='Node 26.7.0'
 elif rid=='R04':
  if rel=='package.json' or rel.startswith('packages/'):
   status='selected workspace graph installed; optional cloud/playground scopes deferred';cmd='bun install --frozen-lockfile --ignore-scripts --filter @hyperframes/core --filter @hyperframes/engine --filter @hyperframes/producer --filter @hyperframes/cli';verify='parsers/lint/studio-server/core/engine/producer/player/studio/CLI final builds checked; see per-package receipt';runtime='Bun 1.4.2; Node 26.7.0'
 elif rid=='R07' and rel=='app/package.json':status='installed';cmd='bun install --frozen-lockfile --ignore-scripts';verify='Three/OpenType import checked; compile with copyPublicDir=false; preview audio absent';runtime='Bun 1.4.2; Node 26.7.0'
 elif rid=='R05':
  if rel.endswith('package.json'):status='installed';cmd='npm ci --ignore-scripts';verify='p5/Puppeteer resolution checked';runtime='Node 26.7.0'
  elif rel.endswith('requirements.txt'):status='installed in isolated .venv';cmd='uv pip install --python .venv/bin/python -r requirements.txt';verify='NumPy/Pillow imports and Python syntax checked';runtime='Python 3.14.3'
  elif rel.endswith('Package.swift'):status='compiled';cmd='swift build using preparation cache';verify='exit 0; no processing executed';runtime='installed Swift; see log'
  else:status='deferred optional Ruby orchestration';cmd='requires modern Ruby and locked Bundler 4.0.20';verify='system Ruby syntax/help only; gems not installed';runtime='Mac Ruby 2.6.10 insufficient for locked dependency set'
 elif rid=='R06':status='installed';cmd='npm install --ignore-scripts --package-lock=false';verify='native Canvas shared module imports checked';runtime='Node 26.7.0'
 elif rid=='R08':status='installed study engine';cmd='npm ci --ignore-scripts';verify='p5/p5.brush/Puppeteer resolution checked';runtime='Node 26.7.0; use render --chrome'
 elif rid=='R09':status='website dependencies deferred; browser-native animation sources available';cmd='none for browser-native engine study';verify='worker/page/six engine syntax checks';runtime='browser WebGL2; website build not prepared'
 elif rid in ['R11','R12','R13']:status='catalog, no animation runtime installation';cmd='none';verify='R11 catalog check passed; R12/R13 inventory';runtime='Node for R11 maintenance; optional R13 maintenance packages deferred'
 matrix.append({'repo_id':rid,'runnable_project_path':x['project_path'],'manifest':rel,'lockfiles':x['lockfiles'],'required_or_verified_runtime':runtime,'installation_command':cmd,'intended_capability':cap,'installation_status':status,'verification_result':verify,'detail_report':x['detail_report']})
with (p/'DEPENDENCY_MATRIX.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=matrix[0]);w.writeheader();w.writerows(matrix)
print('13 repository rows; dependency matrix',len(matrix),'rows; tracked changes',sum(not x['tracked_files_unchanged'] for x in rows))
print('Source/media',sum(x['source_media_bytes'] for x in rows),'Git metadata',sum(x['git_metadata_file_bytes'] for x in rows),'Installed dependencies',sum(x['installed_dependency_file_bytes'] for x in rows))
