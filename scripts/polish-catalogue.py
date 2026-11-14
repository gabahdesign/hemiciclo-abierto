from pathlib import Path
import json
p=Path('public/polls.js');s=p.read_text(encoding='utf8')
s=s.replace('<option value="45">Últimos 45 días</option>','<option value="45">Últimos 45 días</option><option value="90">Últimos 90 días</option><option value="1200">Todo el archivo · mezcla fechas</option>')
s=s.replace('Todas las fichas aptas','Todas las coberturas · ver avisos')
s=s.replace('${e(p.media)} · ${p.totalRecords} registros · ${p.eligible===false?', '${e(p.media)} · ${p.totalRecords} registros · Último registro: ${date(byFirm.get(p.firm)[0].published)} · ${p.eligible===false?')
s=s.replace('${ps.length} encuestadoras incluidas · último registro por casa seleccionada', '${ps.length} registros en el periodo de ${firms.filter(p=>!disabled.has(p.firm)).length} casas seleccionadas · uno por casa')
p.write_text(s,encoding='utf8')
path=Path('public/poll-catalogue-audit.json');audit=json.loads(path.read_text(encoding='utf8'));audit['catalogue']=json.loads(Path('app/data/sondeos.json').read_text(encoding='utf8'))['catalogue'];path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
