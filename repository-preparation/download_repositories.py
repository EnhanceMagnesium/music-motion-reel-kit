import json,subprocess,os,concurrent.futures,time,shutil
from pathlib import Path
kit=Path(__file__).resolve().parent.parent;prep=kit/'repository-preparation';dest=kit/'repository-downloads'
rs=[r for r in json.loads((kit/'source-library/import-ledger.json').read_text()) if r['kind']=='repository']
env=os.environ.copy();env['PATH']=str(prep/'bin')+':'+env['PATH'];env['GIT_LFS_SKIP_SMUDGE']='1';env['GIT_TERMINAL_PROMPT']='0'
def download(r):
 name=r['resolved_url'].removeprefix('https://github.com/');root=dest/name;root.mkdir(parents=True,exist_ok=True);log=prep/'logs'/f"{r['id']}_download.log"; steps=[]
 def run(args,timeout=600,extra=None):
  e=env.copy();e.update(extra or {})
  with log.open('a') as f:
   f.write('\nCOMMAND '+repr(args)+'\n');f.flush();q=subprocess.run(args,cwd=root,env=e,stdout=f,stderr=f,timeout=timeout)
  steps.append({'command':args,'exit':q.returncode});return q.returncode
 rec={'id':r['id'],'url':r['resolved_url'],'commit':r['commit'],'path':str(root),'steps':steps,'lfs_status':'not_checked'}
 try:
  if not (root/'.git').exists():
   if run(['git','init','-q']):raise RuntimeError('init failed')
   if run(['git','remote','add','origin',r['resolved_url']]):raise RuntimeError('remote failed')
  q=subprocess.run(['git','rev-parse','HEAD'],cwd=root,env=env,text=True,capture_output=True)
  if q.stdout.strip()!=r['commit']:
   if run(['git','fetch','--depth=1','origin',r['commit']],timeout=900):raise RuntimeError('fetch failed')
   if run(['git','checkout','--detach',r['commit']]):raise RuntimeError('checkout failed')
  head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,env=env,text=True).strip();rec['head']=head;assert head==r['commit']
  if run(['git','lfs','install','--local','--skip-smudge']):raise RuntimeError('LFS local setup failed')
  ls=subprocess.run(['git','lfs','ls-files','--json'],cwd=root,env=env,text=True,capture_output=True);rec['lfs_before']=(json.loads(ls.stdout or '{}').get('files') or []) if ls.returncode==0 else []
  if rec['lfs_before']:
   if run(['git','lfs','pull'],timeout=1200,extra={'GIT_LFS_SKIP_SMUDGE':'0'}):raise RuntimeError('LFS pull failed')
   if run(['git','lfs','fsck','--objects'],timeout=300):raise RuntimeError('LFS object fsck failed')
   entries=json.loads(subprocess.check_output(['git','lfs','ls-files','--json'],cwd=root,env=env,text=True)).get('files') or [];rec['lfs_objects']=len(entries);rec['lfs_unmaterialized']=[e.get('name') for e in entries if e.get('checkout') is False]
   pointers=[]
   for e in entries:
    f=root/e['name']
    if not f.is_file() or f.open('rb').read(64).startswith(b'version https://git-lfs.github.com/spec/v1'):pointers.append(e['name'])
   rec['remaining_lfs_pointers']=pointers
   if pointers:raise RuntimeError('remaining LFS pointer files')
   rec['lfs_status']='downloaded_and_object_fsck_passed'
  else:rec['lfs_status']='no_lfs_files_at_commit';rec['lfs_objects']=0
  q=subprocess.run(['git','status','--porcelain'],cwd=root,env=env,capture_output=True,text=True);rec['checkout_status']=q.stdout.strip();rec['status']='downloaded_verified'
 except Exception as e:rec['status']='failed';rec['error']=str(e)
 print(r['id'],name,rec['status'],rec.get('error',''),flush=True);return rec
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
 results=list(ex.map(download,rs))
(prep/'DOWNLOAD_RESULTS.json').write_text(json.dumps(results,indent=2))
print('COMPLETE',len(results),'failed',sum(r['status']=='failed' for r in results),flush=True)
