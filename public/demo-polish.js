'use strict';
(()=>{
  const soften=()=>{
    const notice=document.getElementById('notice');
    if(!notice||!notice.textContent.startsWith('DEMOSTRACIÓN'))return;
    document.querySelectorAll('#bars .bar-row').forEach(row=>{
      const value=row.querySelector('strong'),fill=row.querySelector('.bar-fill');
      if(!value||!fill)return;
      const n=parseFloat(value.textContent.replace(',','.'));
      if(Number.isFinite(n)&&n<0.1){value.textContent='0,1 %';fill.style.width='0.8%';}
    });
    document.querySelectorAll('#donut-legend .legend-row span').forEach(el=>{
      el.textContent=el.textContent.replace(/·\s*0[,.]0\s*%/,'· 0,1 %');
    });
  };
  const start=()=>{const bars=document.getElementById('bars');if(!bars)return setTimeout(start,500);new MutationObserver(()=>setTimeout(soften,0)).observe(bars,{childList:true,subtree:true});soften();};
  start();
})();
