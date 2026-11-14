'use strict';
(() => {
  const apply=()=>{
    const field=document.getElementById('poll-window');
    if(field){const label=field.closest('label');if(label&&!label.dataset.removed){label.dataset.removed='1';label.remove();}}
    const range=document.getElementById('poll-history-range');
    if(range&&range.value!=='all'){range.value='all';range.dispatchEvent(new Event('change',{bubbles:true}));}
    const search=document.getElementById('province-search');
    if(search)search.placeholder='Escribe Barcelona, Madrid, Valencia…';
    document.querySelectorAll('.province-map-panel>.note').forEach(n=>{n.textContent='Cartografía y atribución';});
    document.querySelectorAll('.map-city').forEach(c=>c.querySelector('text')?.replaceChildren(document.createTextNode(c.textContent.replace(/\s*↗/g,''))));
    document.querySelectorAll('.party-logo').forEach(el=>el.classList.add('party-logo-square'));
    document.querySelectorAll('.extra-poll-mean,.extra-poll-spread,.history-extra-parties').forEach(el=>el.remove());
  };
  apply();setInterval(apply,1200);
})();
