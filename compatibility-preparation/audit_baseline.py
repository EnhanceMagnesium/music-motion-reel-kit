"""Read pinned tracked source; preserve originals and write compatibility evidence."""
from pathlib import Path
import csv, hashlib, json, subprocess, collections

kit = Path(__file__).resolve().parents[1]
dest = Path(__file__).resolve().parent
catalog = list(csv.DictReader((kit / 'repository-preparation/REPOSITORY_LIBRARY_CATALOG.csv').open()))
code_extensions = {'.js', '.mjs', '.ts', '.tsx', '.py', '.swift', '.rb', '.glsl', '.frag', '.vert'}
hash_groups = collections.defaultdict(list)
repositories = []
for row in catalog:
    root = Path(row['local_path'])
    head = subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
    status = subprocess.check_output(['git', '-C', str(root), 'status', '--porcelain', '--untracked-files=no'], text=True).strip()
    entries = subprocess.check_output(['git', '-C', str(root), 'ls-tree', '-r', '-z', 'HEAD']).split(b'\0')
    sources = []
    for entry in entries:
        if not entry:
            continue
        metadata, raw_path = entry.split(b'\t', 1)
        mode, kind, oid = metadata.decode().split()
        relative = raw_path.decode()
        path = root / relative
        if kind != 'blob' or mode == '120000' or path.suffix.lower() not in code_extensions:
            continue
        data = path.read_bytes()
        sha = hashlib.sha256(data).hexdigest()
        git_blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        record = {'repo_id': row['repo_id'], 'path': str(path), 'relative_path': relative,
                  'sha256': sha, 'bytes': len(data), 'matches_git_blob': git_blob == oid,
                  'approved_role': row['approved_role'], 'license_record': row['license_record']}
        sources.append(record)
        hash_groups[sha].append(record)
    repositories.append({'repo_id': row['repo_id'], 'path': str(root), 'expected_commit': row['commit'],
                         'checked_out_commit': head, 'commit_matches': head == row['commit'],
                         'tracked_status': status, 'code_files': sources})
duplicates = [records for records in hash_groups.values() if len({r['repo_id'] for r in records}) > 1]
result = {'scope': 'Current pinned tracked executable/shader source; symlinks/media excluded.',
          'repositories': repositories, 'cross_repository_exact_code_groups': duplicates,
          'code_files_checked': sum(len(r['code_files']) for r in repositories),
          'code_git_blob_mismatches': sum(not f['matches_git_blob'] for r in repositories for f in r['code_files']),
          'notes': ['Duplicate bytes do not establish identical import/asset contexts or reuse rights.',
                    'Existing dependency preparation is separate from this source baseline audit.']}
(dest / 'CURRENT_BASELINE.json').write_text(json.dumps(result, indent=2) + '\n')
lines = ['CURRENT CROSS-REPOSITORY EXACT CODE DUPLICATES', 'Fresh SHA-256 from pinned local checkouts.',
         'Canonical candidates retain every source path, license and approved role. Import/asset context still needs checking.', '']
for records in sorted(duplicates, key=lambda x: (x[0]['relative_path'], x[0]['sha256'])):
    lines.append('SHA-256: ' + records[0]['sha256'])
    lines.extend(r['repo_id'] + ' | ' + r['path'] + ' | ' + r['approved_role'] for r in records)
    lines.append('')
(dest / 'EXACT_CODE_DUPLICATES.txt').write_text('\n'.join(lines))
summary = {k: result[k] for k in ['code_files_checked', 'code_git_blob_mismatches']}
summary.update(repositories=len(repositories), commits_match=all(r['commit_matches'] for r in repositories),
               tracked_originals_clean=all(not r['tracked_status'] for r in repositories),
               exact_cross_repository_code_groups=len(duplicates))
(dest / 'BASELINE_SUMMARY.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
