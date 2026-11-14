'use strict';
(() => { const apply=()=>{const s=document.getElementById('poll-history-range');if(s&&!s.dataset.allDefault){s.dataset.allDefault='1';s.value='all';s.dispatchEvent(new Event('change'));}};setTimeout(apply,4500);setInterval(apply,1500);})();
