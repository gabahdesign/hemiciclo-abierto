from pathlib import Path
p=Path('public/polls.js');s=p.read_text(encoding='utf8')
def rep(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
rep('Media solo con fichas verificadas.','Por defecto se seleccionan casas con fichas verificadas; puedes incluir las demás con sus avisos.')
rep('Incluir todas las aptas','Incluir todas')
rep('Las fichas pendientes se pueden consultar en el catálogo.','Todas se pueden seleccionar. Las incidencias se indican en cada encuestadora.')
rep('<p class="note" id="poll-summary"></p>', '<p class="note" id="poll-summary"></p><div id="poll-quality" class="notice" role="status" hidden></div>')
rep('La media usa una por casa dentro de la ventana elegida.', 'La media usa una por casa dentro de la ventana elegida.') if 'La media usa una por casa dentro de la ventana elegida.' in s else None
rep('la media usa una por casa dentro de la ventana elegida.', 'la media usa una por casa dentro de la ventana elegida. Las fichas no verificadas se pueden incluir voluntariamente, con advertencia.')
rep("selected=firms.filter(p=>p.eligible!==false&&!disabled.has(p.firm))", "selected=firms.filter(p=>!disabled.has(p.firm))")
rep('${selected.length} de ${firms.filter(p=>p.eligible!==false).length} aptas seleccionadas · ${firms.length} en catálogo', '${selected.length} de ${firms.length} seleccionadas · ${firms.filter(p=>p.eligible!==false).length} con fichas verificadas')
rep('${!disabled.has(p.firm)&&p.eligible!==false}', '${!disabled.has(p.firm)}')
rep("${p.eligible===false?'disabled':''}", '')
rep("${p.eligible===false?'Pendiente':disabled.has(p.firm)?'Incluir +':'Incluida ✓'}", "${disabled.has(p.firm)?'Incluir +':'Incluida ✓'}${p.eligible===false?' · ⚠':''}")
rep("'Última ficha apta: '+date(p.published)", "'Última ficha verificada: '+date(p.published)")
rep('Una encuesta por casa: la última con ficha verificada según fecha de fin de campo. Un registro de repertorio más reciente no sustituye una ficha verificada hasta ser contrastado.', 'Una encuesta por casa seleccionada: la más reciente por fin de campo. Si el campo no consta, se usa la publicación como referencia temporal y se avisa. Se pueden incluir fichas pendientes bajo elección del usuario.')
rep('Las fichas pendientes de verificación quedan fuera;', 'Las fichas pendientes se incluyen solo al seleccionar su encuestadora y se señalan en los avisos;')
rep('Solo publicaciones ya disponibles en esa fecha y campo terminado dentro de la ventana elegida.', 'Solo publicaciones ya disponibles en esa fecha y campo terminado dentro de la ventana elegida; si falta el campo, se usa la fecha de publicación con aviso.')
rep('última ficha apta por casa', 'último registro por casa seleccionada')
rep(" function included(){const latest=new Map();for(const p of source.polls){const age=(anchor-Date.parse(p.end+'T23:59:59Z'))/86400000;if(p.eligible===false||!p.end||disabled.has(p.firm)||age<0||age>+$('poll-window').value||Date.parse(p.published+'T23:59:59Z')>anchor||($('poll-universe').value==='full'&&p.coverage!=='full'))continue;if(!latest.has(p.firm)||latest.get(p.firm).end<p.end)latest.set(p.firm,p);}return [...latest.values()];}", " function referenceDate(p){return p.end||p.published;}\n function included(){const latest=new Map();for(const p of source.polls){const ref=referenceDate(p);if(!ref)continue;const age=(anchor-Date.parse(ref+'T23:59:59Z'))/86400000;if(disabled.has(p.firm)||age<0||age>+$('poll-window').value||p.published&&Date.parse(p.published+'T23:59:59Z')>anchor||($('poll-universe').value==='full'&&p.coverage!=='full'))continue;if(!latest.has(p.firm)||referenceDate(latest.get(p.firm))<ref)latest.set(p.firm,p);}return [...latest.values()];}\n function comparable(p,party){return typeof p.values[party]==='number'&&(p.eligible===false||p.comparable.includes(party));}\n")
rep("p.comparable.includes(party)&&typeof p.values[party]==='number'", "comparable(p,party)")
rep("Date.parse(p.end+'T23:59:59Z')", "Date.parse(referenceDate(p)+'T23:59:59Z')")
rep(" $('poll-average').innerHTML=", " const issues=ps.flatMap(p=>{const notes=[];if(p.eligible===false)notes.push(p.reason||'Ficha pendiente de verificación.');if(!p.end)notes.push('Sin fecha de campo: se usa la publicación para la ventana y antigüedad.');if(!Object.values(p.values).some(v=>typeof v==='number'))notes.push('No hay porcentajes transcritos: no aporta valores a la media.');return notes.length?[{firm:p.firm,notes}]:[];});$('poll-quality').hidden=!issues.length;$('poll-quality').innerHTML=issues.length?`<strong>⚠ La selección incluye ${issues.length} fichas con incidencias.</strong><p>La media incorpora los porcentajes disponibles tal como constan en esas fuentes. Algunos datos o su comparabilidad están pendientes de comprobar; no se sustituyen ausencias por cero.</p><details><summary>Ver incidencias de la selección</summary>${issues.map(i=>`<p><b>${e(i.firm)}</b>: ${i.notes.map(e).join(' ')}</p>`).join('')}</details>`:'';\n $('poll-average').innerHTML=")
rep("for(const p of firms)if(p.eligible!==false)disabled.delete(p.firm)","for(const p of firms)disabled.delete(p.firm)")
rep('lastExport={catalogue:source.catalogue,', 'lastExport={issues,catalogue:source.catalogue,')
p.write_text(s,encoding='utf8')
