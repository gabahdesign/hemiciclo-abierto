"""Correcciones de denominaciones del Congreso, BOE-A-2026-23383 (7-11)."""
import json,shutil
from pathlib import Path
base=Path('public/candidaturas.json');data=json.loads(base.read_text(encoding='utf8'))
backup=Path('../backup-candidaturas-antes-20261107.json')
if not backup.exists():shutil.copy2(base,backup)
changes=[('2026-325','EUSKAL HERRIA BILDU (EH BILDU)','EH BILDU','EH BILDU'),('2026-335','FRENTE AMPLIO-FRONTE ZABALA (FRENTE AMPLIO-FRONTE ZABALA)','FRENTE AMPLIO-FRONTE ZABALA','FRENTE AMPLIO-FRONTE ZABALA')]
for id,name,short,group in changes:
 row=next(p for p in data['2026'] if p['id']==id)
 row.update(name=name,short=short,group=group,corrected='2026-11-07',correctionSource='https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23383')
for p in [base,Path('app/data/candidaturas.json')]:p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
a=Path('public/audit.json');audit=json.loads(a.read_text(encoding='utf8'));audit['checked']='2026-11-07';audit['correctionSource']='https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23383';audit['scope']+=' Denominaciones de Navarra corregidas según BOE del 7/11; el hash corresponde al documento original del 3/11.'
nav=next(p for p in audit['provinces'] if p['province']=='NAVARRA')
for ballot in nav['ballots']:
 if ballot['group']=='EH BILDU-ERC':ballot.update(name='EUSKAL HERRIA BILDU (EH BILDU)',group='EH BILDU')
 if ballot['group']=='FRENTE AMPLIO-FRONTE ZABALA':ballot['name']='FRENTE AMPLIO-FRONTE ZABALA (FRENTE AMPLIO-FRONTE ZABALA)'
a.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('2 denominaciones de Navarra corregidas; IDs conservados.')
