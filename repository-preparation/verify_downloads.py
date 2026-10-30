from pathlib import Path
import json,subprocess,os,hashlib,csv
kit=Path(__file__).resolve().parent.parent; prep=kit/'repository-preparation';env=os.environ.copy();env['PATH']=str(prep/'bin')+':'+env['PATH']
rs=[r for r in json.loads((kit/'source-library/import-ledger.json').read_text()) if r['kind']=='repository'];reports=[]
for r in rs:
 root=kit/'repository-downloads'/r['resolved_url'].removeprefix('https://github.com/');head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();data=json.loads(subprocess.check_output(['git','lfs','ls-files','--json'],cwd=root,env=env,text=True));lfs={x['name']:x for x in data.get('files') or []};tree=json.loads((kit/'repository-context-audit'/f'{r["id"]}_PINNED_TREE.json').read_text())['tree'];bad=[];files=0;logical=0
 for x in tree:
  if x['type']=='tree':continue
  files+=1;p=root/x['path']
  if p.is_symlink():
   b=os.readlink(p).encode();sha=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();logical+=len(b)
  elif p.is_file():
   size=p.stat().st_size;logical+=size; h=hashlib.sha256() if x['path'] in lfs else hashlib.sha1()
   if x['path'] not in lfs:h.update(b'blob '+str(size).encode()+b'\0')
   with p.open('rb') as f:
    for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
   sha=h.hexdigest()
  else:bad.append({'path':x['path'],'reason':'missing_checkout_entry'});continue
  expected=lfs[x['path']]['oid'] if x['path'] in lfs else x['sha']
  if sha!=expected:bad.append({'path':x['path'],'reason':'content_hash_mismatch'})
 rec={'id':r['id'],'url':r['resolved_url'],'expected_commit':r['commit'],'head':head,'commit_matches':head==r['commit'],'expected_entries':files,'verified_entries':files-len(bad),'lfs_entries':len(lfs),'working_content_bytes':logical,'issues':bad,'status':'verified' if head==r['commit'] and not bad else 'issues'}
 reports.append(rec);print(r['id'],rec['status'],files,'entries',len(lfs),'LFS',flush=True)
(prep/'CHECKOUT_INTEGRITY.json').write_text(json.dumps(reports,indent=2))
print('TOTAL',sum(x['working_content_bytes'] for x in reports),'bytes',sum(len(x['issues']) for x in reports),'issues')
