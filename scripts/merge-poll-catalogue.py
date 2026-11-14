import json,hashlib
from pathlib import Path
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
data=read('app/data/sondeos.json')
direct=[p for p in data['polls'] if p.get('provenance')!='archive']
for filename in ['primary-additions-a.json','primary-additions-b.json']:
 for p in read('../poll-research/'+filename):
  direct=[old for old in direct if old['id']!=p['id']];direct.append(p)
merged=[];conflicts=[]
for a in read('../poll-research/archive-records.json'):
 matches=[p for p in direct if p['firm']==a['firm'] and (p.get('end') and p['end']==a['end'] or not p.get('end') and p.get('published')==a.get('published'))]
 if matches:
  p=matches[0];p['archiveUrl']=a['sourceUrl']
  diffs={k:{'original':v,'repertorio':a['values'][k]}for k,v in p['values'].items() if k in a['values'] and v!=a['values'][k]}
  if diffs:
   p['sourceDiscrepancy']=diffs;conflicts.append({'id':p['id'],'firm':p['firm'],'values':diffs})
 else:merged.append(a)
for p in direct:
 p.setdefault('provenance','primary' if p['firm']!='GESOP' else 'secondary')
 p.setdefault('eligible',True)
 p.setdefault('coverage','unspecified')
 p.setdefault('comparable',[])
 if p.get('sourceDiscrepancy'):p['note']+=' Hay discrepancias con el repertorio de archivo; se conservan los valores de la publicación original.' if 'Hay discrepancias' not in p['note'] else ''
 merged.append(p)
merged.sort(key=lambda p:(p.get('published') or p.get('end') or '',p.get('end') or ''),reverse=True)
assert len({p['id']for p in merged})==len(merged)
for p in merged:
 assert p['published'] is None or p['published']<='2026-11-03'
 assert all(isinstance(v,(int,float)) and 0<=v<=100 for v in p['values'].values())
 assert p['provenance']!='archive' or p['eligible'] is False
data['polls']=merged
data['catalogue']={'title':'Archivo estatal desde el 24 de julio de 2023','from':'2023-07-24','until':'2026-11-03','records':len(merged),'firms':len({p['firm']for p in merged}),'eligibleRecords':sum(p['eligible']for p in merged),'originalRecords':len(direct),'archiveRecords':sum(p['provenance']=='archive'for p in merged),'source':'Wikipedia: Opinion polling for the 2026 Spanish general election','sourceUrl':'https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Spanish_general_election','license':'Archivo adaptado bajo CC BY-SA 4.0; las fuentes primarias conservan sus propios derechos.','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','limitations':'Se han incorporado las filas inequívocas de las tablas de estimación estatal, además de publicaciones originales revisadas. Se excluyen resultados electorales, intención directa, escenarios alternativos, promedios y reestimaciones. No se garantiza que el repertorio incluya todos los sondeos publicados. Las filas con varios escenarios quedan en el registro de revisión. Actualización documental manual; sin búsqueda automática.'}
data['pending']=[p for p in data['pending'] if p['firm']!='Sigma Dos']
Path('app/data/sondeos.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
audit={'cutoff':data['updated'],'catalogue':data['catalogue'],'sourceSha256':hashlib.sha256(Path('../poll-research/wikipedia.html').read_bytes()).hexdigest(),'discrepancies':conflicts,'requiresIndividualReview':read('../poll-research/archive-skipped.json')}
Path('public/poll-catalogue-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(data['catalogue'],ensure_ascii=True))
