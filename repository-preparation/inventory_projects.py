import json,csv,subprocess
from pathlib import Path
kit=Path(__file__).resolve().parent.parent;prep=kit/'repository-preparation';rs=[r for r in json.loads((kit/'source-library/import-ledger.json').read_text()) if r['kind']=='repository'];rows=[]
for r in rs:
 root=kit/'repository-downloads'/r['resolved_url'].removeprefix('https://github.com/');files=subprocess.check_output(['git','ls-files'],cwd=root,text=True).splitlines();found=False
 for fn in files:
  name=Path(fn).name
  if not (name in ['package.json','pyproject.toml','Gemfile','Cargo.toml','Package.swift','setup.py','Pipfile'] or (name.startswith('requirements') and name.endswith('.txt'))):continue
  p=root/fn;found=True;locks=[n for n in ['package-lock.json','bun.lock','bun.lockb','pnpm-lock.yaml','yarn.lock','uv.lock','Gemfile.lock','Cargo.lock'] if (p.parent/n).exists()];engines='';deps='';scripts='';manager=''
  if p.name=='package.json':
   try:
    d=json.loads(p.read_text());engines=json.dumps(d.get('engines',{}));deps=json.dumps(d.get('dependencies',{}),sort_keys=True);scripts=json.dumps(d.get('scripts',{}),sort_keys=True);manager=d.get('packageManager','')
   except Exception:pass
  else:deps=p.read_text(errors='replace');engines='see original manifest and preparation receipt'
  rows.append({'repo_id':r['id'],'project_path':str(p.parent),'manifest':fn,'lockfiles':'; '.join(locks),'declared_package_manager':manager,'runtime_requirements':engines,'declared_dependencies':deps,'declared_scripts':scripts,'local_node_modules_present':(p.parent/'node_modules').is_dir(),'local_venv_present':(p.parent/'.venv').is_dir(),'preparation_status':'see corresponding DEPENDENCIES.json for installed/ancestor-resolved/workspace/deferred classification','detail_report':{'R01':'R01_R03','R02':'R01_R03','R03':'R01_R03','R04':'R04_R07','R07':'R04_R07'}.get(r['id'],'R05_R13')+'_DEPENDENCIES.json'})
 if not found:rows.append({'repo_id':r['id'],'project_path':str(root),'manifest':'none discovered among tracked root/subproject manifests','lockfiles':'','declared_package_manager':'','runtime_requirements':'see docs/source scripts','declared_dependencies':'','declared_scripts':'','local_node_modules_present':False,'local_venv_present':False,'preparation_status':'catalog or browser-native scope; consult detail report','detail_report':'R05_R13_DEPENDENCIES.json'})
with (prep/'DEPENDENCY_PROJECT_INVENTORY.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0]);w.writeheader();w.writerows(rows)
print('Manifest rows:',len(rows))
