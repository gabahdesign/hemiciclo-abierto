'use strict';
(() => {
  const colours={PP:'#0056A8',PSOE:'#E30613',VOX:'#63BE21',SUMAR:'#E51C55',PODEMOS:'#6B1F5F',ERC:'#DA4B2C',JUNTS:'#00B7AE','EH BILDU':'#B5CF18',PNV:'#00843D',BNG:'#76BCE8',SALF:'#734A96','FRENTE AMPLIO':'#E51C55'};
  const run=async()=>{const svg=document.getElementById('hero-seats');if(!svg||svg.dataset.extraSeats==='1')return;let source;try{source=await(await fetch('/api/sondeos',{cache:'no-store'})).json();}catch{return;}
    const keys=Object.keys(colours), values={}; keys.forEach(k=>values[k]=[]);
    for(const poll of source.polls||[]){if(poll.eligible===false)continue;for(const k of keys){const v=poll.values?.[k];if(Number.isFinite(v))values[k].push(v);}}
    const averages=Object.fromEntries(keys.map(k=>[k,values[k].length?values[k].reduce((a,b)=>a+b,0)/values[k].length:0]));
    const totals=keys.reduce((a,k)=>a+averages[k],0)||1;let parties=[];keys.forEach(k=>{const n=Math.max(averages[k]>=0.8?1:0,Math.round(averages[k]/totals*350));for(let i=0;i<n;i++)parties.push(k);});while(parties.length<350)parties.push('PP');parties=parties.slice(0,350);
    const dots=[];for(let ring=0;ring<10;ring++){const n=26+ring*2,r=110+ring*11;for(let i=0;i<n;i++){const a=Math.PI-Math.PI*i/(n-1);dots.push({x:230+r*Math.cos(a),y:235-r*Math.sin(a)});}}
    const positions=dots.slice(0,350).sort((a,b)=>a.x-b.x||a.y-b.y);svg.innerHTML=positions.map((d,i)=>`<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="3.4" fill="${colours[parties[i]]||'#858585'}"><title>${parties[i]}</title></circle>`).join('')+'<text x="230" y="205" text-anchor="middle" font-family="Barlow Condensed,Impact,sans-serif" font-weight="900" font-size="42">350</text><text x="230" y="224" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" letter-spacing="2">SONDEOS + WEB</text>';svg.dataset.extraSeats='1';
  };setTimeout(run,5200);
})();
