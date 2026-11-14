'use strict';
(() => {
  const files={
    PSOE:'/logos/psoe.svg',PSC:'/logos/psoe.svg','PSdeG-PSOE':'/logos/psoe.svg','PSIB-PSOE':'/logos/psoe.svg','PSN-PSOE':'/logos/psoe.svg','PSE-EE':'/logos/psoe.svg',
    PP:'/logos/pp.svg',VOX:'/logos/vox.svg',SUMAR:'/logos/sumar.svg',PODEMOS:'/logos/podemos.svg',ERC:'/logos/erc.svg',JUNTS:'/logos/junts.svg','JUNTS PER CATALUNYA':'/logos/junts.svg','JXCAT':'/logos/junts.svg','EH BILDU':'/logos/bildu.svg',BNG:'/logos/bng.svg',PNV:'/logos/pnv.svg','EAJ-PNV':'/logos/pnv.svg',SALF:'/logos/salf.png',PACMA:'/logos/pacma.svg',CC:'/logos/cc.svg','COALICIÓN CANARIA':'/logos/cc.svg','FRENTE AMPLIO':'/logos/frente_amplio.svg','COMPROMÍS':'/logos/compromis.svg','COMPROMIS':'/logos/compromis.svg',UPN:'/logos/upn.svg','UPN-PP':'/logos/upn.svg'
  };
  const find=text=>{const t=text.toUpperCase();if(/PSDEG|PSIB|PSN-PSOE|PSE-EE|PSC-PSOE|PARTIT DELS SOCIALISTES|PARTIDO SOCIALISTA/.test(t))return files.PSOE;for(const [key,url] of Object.entries(files)){if(new RegExp(`(^|[^A-ZÁÉÍÓÚÜÑ])${key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?=$|[^A-ZÁÉÍÓÚÜÑ])`,'i').test(text))return url;}return null;};
  const apply=()=>document.querySelectorAll('.party-logo,.party-logo-square').forEach(el=>{const card=el.closest('article,details,button,.program-item,.compare-party-card');const url=find(card?.textContent||'');if(!url)return;el.style.backgroundImage=`url("${url}")`;el.style.backgroundSize='contain';el.style.backgroundRepeat='no-repeat';el.style.backgroundPosition='center';el.style.backgroundColor='#fff';el.textContent='';if(!el.querySelector('img')){const img=document.createElement('img');img.src=url;img.alt='';img.setAttribute('aria-hidden','true');el.appendChild(img);}el.setAttribute('aria-label','Logo de la candidatura');});
  apply();setInterval(apply,1000);
})();
