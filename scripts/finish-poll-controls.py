import json
from pathlib import Path
p=Path('public/polls.js');s=p.read_text(encoding='utf8')
def rep(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
rep("${p.provenance==='archive'?'REPERTORIO · SIN CONTRASTAR':p.eligible===false?'FICHA PENDIENTE':ps.includes(p)?'INCLUIDA':'FUERA DEL AGREGADO'}", "${ps.includes(p)?'INCLUIDA · ':''}${p.provenance==='archive'?'REPERTORIO SIN CONTRASTAR':p.eligible===false?'FICHA PENDIENTE':ps.includes(p)?'VERIFICADA':'FUERA DEL AGREGADO'}")
rep("${s.n>=2?s.min.toFixed(1)+' % → '+s.max.toFixed(1)+' %':'Sin dos casas comparables'}</span></div><div class=\"spread-track\">", "${s.n>=2?s.min.toFixed(1)+' % → '+s.max.toFixed(1)+' %':'Sin dos casas comparables'}</span></div>${s.n>=2?`<div class=\"spread-average\"><b>MEDIA ${s.mean.toFixed(1)} %</b><small>Punto medio del rango: ${((s.min+s.max)/2).toFixed(1)} % · (mín. + máx.) / 2</small></div>`:''}<div class=\"spread-track\">")
rep("${s.observations.map(p=>`<span style=", "<b class=\"spread-mean-marker\" style=\"left:${s.mean/40*100}%\" title=\"Media de los sondeos: ${s.mean.toFixed(1)} %\"></b>${s.observations.map(p=>`<span style=")
rep('MÍNIMO → MÁXIMO','MÍNIMO · MEDIA · MÁXIMO')
rep('El intervalo es el mínimo y máximo observados entre sondeos incluidos, sin ponderar.', 'Los extremos son el mínimo y máximo observados. El rombo señala la media de los sondeos con el método elegido; el punto medio del rango se calcula como (mínimo + máximo) / 2.')
p.write_text(s,encoding='utf8')
datafile=Path('app/data/sondeos.json');data=json.loads(datafile.read_text(encoding='utf8'))
replacements={'este registro no participa en la media.':'este registro se puede incluir voluntariamente con aviso de verificación pendiente.','Visible en el catálogo, excluido de la media hasta completar la ficha.':'Visible en el catálogo y seleccionable con aviso de ficha incompleta.','No entra en el agregado.':'Puede incluirse voluntariamente con aviso de universo ambiguo.','No entra en la media.':'Puede incluirse voluntariamente con aviso de ficha incompleta.','Visible como referencia pendiente, fuera de la media.':'Visible como referencia pendiente, seleccionable con aviso.'}
for poll in data['polls']:
 for old,new in replacements.items():poll['note']=poll['note'].replace(old,new)
data['catalogue']['limitations']+=' Todas las casas son seleccionables. La selección inicial prioriza fichas verificadas. Al incluir registros pendientes se avisa en cada casa y en la media; si falta el campo se usa la publicación como fecha de referencia.'
datafile.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
