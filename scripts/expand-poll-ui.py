from pathlib import Path
p=Path('public/polls.js');s=p.read_text(encoding='utf-8-sig')
def rep(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
rep('FUENTES ORIGINALES · DATOS REALES','PUBLICACIONES · ARCHIVO DOCUMENTADO')
rep('Catálogo inicial, no exhaustivo.','<span id="catalogue-coverage"></span>')
rep('<div class="poll-catalog-tools"><label>', '<details id="catalogue-provenance"><summary>Cobertura del archivo y fuentes</summary><div id="catalogue-provenance-body"></div></details><div class="poll-catalog-tools"><label>Periodo del archivo<select id="catalog-year"><option value="all">Desde julio de 2023</option><option>2026</option><option>2025</option><option>2024</option><option>2023</option></select></label><label>')
rep('<option value="pending">Fichas pendientes</option>', '<option value="pending">Fichas pendientes</option><option value="original">Publicaciones revisadas</option><option value="archive">Registros del repertorio</option>')
start=s.index(' const disabled=new Set(');end=s.index('\n function renderPicker()',start)
s=s[:start]+''' const byFirm=new Map();for(const p of source.polls){if(!byFirm.has(p.firm))byFirm.set(p.firm,[]);byFirm.get(p.firm).push(p);}const firms=[...byFirm].map(([firm,rows])=>{const verified=rows.filter(p=>p.eligible!==false),representative=verified[0]||rows[0];return {...representative,firm,eligible:!!verified.length,totalRecords:rows.length,media:[...new Set(rows.map(p=>p.media))].join(' / ')};}).sort((a,b)=>a.firm.localeCompare(b.firm,'es'));const disabled=new Set(firms.filter(p=>!p.eligible).map(p=>p.firm)),anchor=Date.parse(source.updated+'T23:59:59Z');let lastExport,cardLimit=6;
 const c=source.catalogue;$('catalogue-coverage').textContent=c?`${c.records} registros · ${c.firms} casas o encargantes · archivo desde julio de 2023. Media solo con fichas verificadas.`:'';if(c)$('catalogue-provenance-body').innerHTML=`<p>${e(c.limitations)}</p><p>${c.originalRecords} publicaciones revisadas individualmente; ${c.archiveRecords} registros del repertorio pendientes de contraste. ${c.eligibleRecords} fichas aptas en el histórico; la media usa una por casa dentro de la ventana elegida.</p><p><a href="${e(c.sourceUrl)}" target="_blank" rel="noopener">Repertorio de procedencia y colaboradores de Wikipedia ↗</a> · <a href="${e(c.licenseUrl)}" target="_blank" rel="noopener">${e(c.license)}</a> · <a href="/poll-catalogue-audit.json" target="_blank">Registro de revisión y discrepancias ↗</a></p>`;
''' +s[end:]
rep("'Última publicación: '+date(p.published)","'Última ficha apta: '+date(p.published)")
rep('${e(p.media)} · ${p.eligible===false?', '${e(p.media)} · ${p.totalRecords} registros · ${p.eligible===false?')
rep('Una encuesta por casa: la última según fecha de fin de campo.', 'Una encuesta por casa: la última con ficha verificada según fecha de fin de campo. Un registro de repertorio más reciente no sustituye una ficha verificada hasta ser contrastado.')
rep('una publicación por casa · fecha', 'última ficha apta por casa · fecha')
rep("(p.firm+' '+p.media).toLocaleLowerCase('es').includes(query)","(p.firm+' '+p.media+' '+(p.published||p.end||'')).toLocaleLowerCase('es').includes(query)&&($('catalog-year').value==='all'||(p.end||p.published||'').startsWith($('catalog-year').value))")
rep("status==='excluded'&&!ps.includes(p)","status==='excluded'&&!ps.includes(p)||status==='original'&&p.provenance!=='archive'||status==='archive'&&p.provenance==='archive'")
rep("${p.eligible===false?'FICHA PENDIENTE':ps.includes(p)?", "${p.provenance==='archive'?'REPERTORIO · SIN CONTRASTAR':p.eligible===false?'FICHA PENDIENTE':ps.includes(p)?")
rep('Leer publicación original y ficha ↗', "${p.provenance==='archive'?'Referencia recogida en el repertorio ↗':'Leer publicación y ficha ↗'}")
rep('${e(p.note)}</p></details>', '${e(p.note)}</p>${p.sourceUrl?`<p><a href="${e(p.sourceUrl)}" target="_blank" rel="noopener">Ver repertorio de procedencia ↗</a> · CC BY-SA 4.0</p>`:\'\'}</details>')
rep('lastExport={cutoff:', 'lastExport={catalogue:source.catalogue,cutoff:')
rep("$('catalog-status').onchange=()=>{cardLimit=6;render();};", "$('catalog-status').onchange=()=>{cardLimit=6;render();};$('catalog-year').onchange=()=>{cardLimit=6;render();};")
p.write_text(s,encoding='utf8')
