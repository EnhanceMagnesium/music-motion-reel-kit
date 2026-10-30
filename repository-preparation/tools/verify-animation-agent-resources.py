#!/usr/bin/env python3
"""Read-only structural validation for the R14-R16 agent resource integration."""
from pathlib import Path
import csv, hashlib, json, re, subprocess, sys
ROOT=Path('.')
OUT=ROOT/'repository-preparation/animation_agent_resource_static_check_2026-10-27.json'
EXPECTED={
 'R14':('whaleyxbt','claude-motion','e627941543d9988b155dc610bb9cc0115a5e365e','ca02fba63bfcc89f475a8672dd852a220005a17325fc05d7f2299f5adf7f10a4'),
 'R15':('LottieFiles','motion-design-skill','f9a8a041b85185ee4881b3471d3415e939aac772','9fc2e8685daa09e28d54b6afa8a38f168417c5735a3cd676c80c159785e93a80'),
 'R16':('greensock','gsap-skills','aed9cfd3277740755f6bfc1155c7aa645403b760','51b04b06556662dd817e8f4aa6d06bc7139dc73739e1319a7233cfde3e147b90'),
}
SKILLS=['motion-craft','lottiefiles-motion-principles','gsap-core','gsap-timeline','gsap-react','gsap-performance','gsap-plugins','gsap-utils']
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]; errors=[]
def record(name,ok,detail):
 checks.append({'check':name,'passed':bool(ok),'detail':detail})
 if not ok: errors.append(name)
# Catalog rows and checkouts.
with (ROOT/'repository-preparation/REPOSITORY_LIBRARY_CATALOG.csv').open(newline='',encoding='utf-8') as f: cat=list(csv.DictReader(f))
ids=[x['repo_id'] for x in cat]
record('catalog_has_unique_R01_R16',ids==[f'R{i:02}' for i in range(1,17)],f'rows={len(ids)}; ids={ids}')
for rid,(owner,repo,commit,license_hash) in EXPECTED.items():
 row=next((x for x in cat if x['repo_id']==rid),{})
 checkout=ROOT/'repository-downloads'/owner/repo
 actual=subprocess.check_output(['/usr/bin/git','-C',str(checkout),'rev-parse','HEAD'],text=True).strip() if checkout.exists() else None
 shallow=subprocess.check_output(['/usr/bin/git','-C',str(checkout),'rev-parse','--is-shallow-repository'],text=True).strip() if checkout.exists() else 'missing'
 dirty=subprocess.check_output(['/usr/bin/git','-C',str(checkout),'status','--porcelain'],text=True).strip() if checkout.exists() else 'missing'
 files=subprocess.check_output(['/usr/bin/git','-C',str(checkout),'ls-files','-z']).decode().split('\0')[:-1] if checkout.exists() else []
 lfs=sum(1 for rel in files if (checkout/rel).is_file() and (checkout/rel).read_bytes()[:120].startswith(b'version https://git-lfs.github.com/spec/v1'))
 link_count=sum(1 for line in subprocess.check_output(['/usr/bin/git','-C',str(checkout),'ls-files','-s'],text=True).splitlines() if line.startswith('160000 ')) if checkout.exists() else -1
 record(rid+'_checkout_catalog_commit_clean',bool(row) and row.get('commit')==commit and row.get('local_path')==str(checkout) and actual==commit and shallow=='false' and dirty=='',f'commit={actual}; shallow={shallow}; tracked={len(files)}; clean={not bool(dirty)}; catalog_path_match={row.get("local_path")==str(checkout)}')
 record(rid+'_license_lfs_submodule',bool((checkout/'LICENSE').exists()) and sha(checkout/'LICENSE')==license_hash and lfs==0 and link_count==0 and not (checkout/'.gitmodules').exists() and not (checkout/'.gitattributes').exists(),f'license_sha_ok={((checkout/"LICENSE").exists() and sha(checkout/"LICENSE")==license_hash)}; lfs_pointers={lfs}; gitlinks={link_count}; .gitmodules={ (checkout/".gitmodules").exists() }; .gitattributes={ (checkout/".gitattributes").exists() }')
# Matrix rows.
with (ROOT/'repository-preparation/DEPENDENCY_MATRIX.csv').open(newline='',encoding='utf-8') as f: matrix=list(csv.DictReader(f))
record('dependency_matrix_R14_R16',all(sum(1 for x in matrix if x['repo_id']==rid)==1 for rid in EXPECTED),f'new row counts={ {rid:sum(1 for x in matrix if x["repo_id"]==rid) for rid in EXPECTED} }')
# Local skill folders, frontmatter, provenance, and source hashes.
manifest=json.loads((ROOT/'repository-preparation/ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json').read_text())
record('manifest_has_16_skill_copies',len(manifest.get('skills',[]))==16,f"copies={len(manifest.get('skills',[]))}")
for agent in ['.claude/skills','.agents/skills']:
 actual_names=sorted(x.name for x in (ROOT/agent).iterdir() if x.is_dir())
 record(agent+'_contains_expected_skill_dirs',actual_names==sorted(SKILLS),str(actual_names))
for entry in manifest.get('skills',[]):
 dest=ROOT/entry['installed_path']; skill=dest/'SKILL.md'
 data=skill.read_text() if skill.exists() else ''
 front=data.split('---',2)[1] if data.startswith('---\n') and data.count('---')>=2 else ''
 name=re.search(r'^name:\s*([^\n]+)$',front,re.M)
 valid=skill.exists() and name and name.group(1)==entry['name'] and (dest/'KIT_INTEGRATION.md').is_file() and (dest/'PROVENANCE.md').is_file() and (dest/'LICENSE').is_file()
 record(entry['installed_path']+'_frontmatter_and_sidecars',valid,f"name={name.group(1) if name else None}; skill_exists={skill.exists()}")
 record(entry['installed_path']+'_installed_hash',skill.exists() and sha(skill)==entry['installed_skill_sha256'],f"actual={sha(skill) if skill.exists() else None}")
 for key,rel in [('kit_integration_sha256','KIT_INTEGRATION.md'),('provenance_sha256','PROVENANCE.md'),('license_copy_sha256','LICENSE')]:
  check=dest/rel; record(entry['installed_path']+'_'+rel+'_hash',check.exists() and sha(check)==entry.get(key),f"actual={sha(check) if check.exists() else None}")
 repo=entry['repository_id']; owner,repo_name,_,_=EXPECTED[repo]; upstream=ROOT/'repository-downloads'/owner/repo_name/entry['upstream_skill_path']
 source_ok=upstream.is_dir()
 for item in entry['files']:
  src=upstream/item['path']; dst=dest/item['path']
  if not src.is_file() or not dst.is_file() or sha(src)!=item['source_sha256'] or sha(dst)!=item['installed_sha256'] or (not item['modified'] and src.read_bytes()!=dst.read_bytes()): source_ok=False
 record(entry['installed_path']+'_source_copy_hashes',source_ok,f"source_skill={entry['upstream_skill_path']}; files={len(entry['files'])}")
# Lottie skill's relative support references must all resolve locally.
lottie=ROOT/'.agents/skills/lottiefiles-motion-principles'
missing=[]
for md in lottie.rglob('*.md'):
 for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)',md.read_text()):
  target=target.split('#',1)[0]
  if not target or '://' in target or target.startswith('mailto:'): continue
  if not (md.parent/target).resolve().exists(): missing.append(f'{md.relative_to(lottie)} -> {target}')
record('lottie_local_relative_links_resolve',not missing,missing[:12])
# Current guidance and character limits.
active=[ROOT/x for x in ['README.md','AGENTS.md','CLAUDE.md','PROJECT_INSTRUCTIONS.md','CODEX_LOCAL_FULL_SONG_PRODUCTION_PROMPT.txt','claude-finished-song-animation-project/00_SETUP_README.txt','claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt','claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt','claude-finished-song-animation-project/03_REUSABLE_SOURCE_ROUTER.txt','claude-finished-song-animation-project/04_REUSABLE_PRODUCTION_STANDARD.txt','claude-finished-song-animation-project/05_NEW_SONG_CONVERSATION_PROMPT.txt','claude-finished-song-animation-project/06_ANIMATION_REFERENCE_CRAFT_GUIDE.txt','claude-finished-song-animation-project/08_ONE_PROMPT_PRODUCTION_AND_LEARNING.txt','claude-finished-song-animation-project/10_MOVING_IMAGE_ARCHIVE_WORKFLOW.txt','claude-finished-song-animation-project/12_CODE_ANIMATION_REFERENCE_WORKFLOW.txt','claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt','claude-finished-song-animation-project/15_MEDIA_API_DISCOVERY_WORKFLOW.txt','reusable-animation-context/00_REUSABLE_SOURCE_LIBRARY_GUIDE.txt','reusable-animation-context/01_TECHNIQUE_ROUTER.txt','reusable-animation-context/REUSABLE_ANIMATION_SOURCE_ROUTER.txt','repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md']]
stale=[]
for p in active:
 for pat in ['R01–R13','R01-R13','all-13 repository','all-13 repo','all 13 repositories','all 13 repos']:
  if pat in p.read_text(): stale.append(f'{p.relative_to(ROOT)}:{pat}')
record('current_guidance_no_stale_R01_R13_total',not stale,stale)
goal=(ROOT/'claude-finished-song-animation-project/01_PROJECT_DESCRIPTION_TO_PASTE.txt').read_text(); instr=(ROOT/'claude-finished-song-animation-project/02_PROJECT_INSTRUCTIONS_TO_PASTE.txt').read_text()
record('paste_template_char_limits',len(goal)<8000 and len(instr)<16000,{'goal':len(goal),'project_instructions':len(instr),'limits':[8000,16000]})
for rel in ['repository-preparation/ANIMATION_AGENT_SKILL_RESOURCES_GUIDE.md','repository-preparation/ANIMATION_AGENT_SKILL_INSTALL_MANIFEST.json','repository-preparation/REPOSITORY_NAVIGATION_AND_USE_GUIDE.md','claude-finished-song-animation-project/13_REPOSITORY_NAVIGATION_AND_USE.txt']:
 record('required_navigation_path_'+rel,(ROOT/rel).is_file(),str(ROOT/rel))
result={'active_kit':str(ROOT),'date':'2026-10-27','check_count':len(checks),'failure_count':len(errors),'checks':checks,'failures':errors,'note':'Read-only/static checks only; this does not load an agent app, run animation code, open a browser, or render media.'}
OUT.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
sys.exit(1 if errors else 0)
