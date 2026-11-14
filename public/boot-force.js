'use strict';
(() => { const files=['/ui-enhance.js','/poll-enhance-retry.js','/poll-history-lines.js','/poll-sort.js','/results-polish.js']; const add=src=>{if(!document.querySelector(`script[src="${src}"]`)){const s=document.createElement('script');s.src=src;document.body.appendChild(s);}}; setTimeout(()=>files.forEach(add),5000); })();
