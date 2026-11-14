'use strict';
(() => {
  const run = () => {
    document.querySelector('#inicio .eyebrow span')?.remove();
    document.querySelector('.hero-chart .stamp')?.classList.add('stamp-clean');
    const history = document.getElementById('poll-history-range');
    if (history && history.value !== 'all') { history.value = 'all'; history.dispatchEvent(new Event('change', {bubbles:true})); }
    const notice = document.getElementById('seat-notice');
    if (notice) notice.textContent = 'RESULTADOS VISIBLES · combinación de la media de los sondeos disponibles y de la participación de esta comunidad. El reparto es una simulación; no es un resultado oficial.';
    const select = document.getElementById('poll-window');
    if (select) {
      const label = select.closest('label');
      if (label && !label.querySelector('.poll-window-status')) {
        const status = document.createElement('small');
        status.className = 'poll-window-status';
        status.setAttribute('aria-live','polite');
        label.append(status);
        const update = () => { status.textContent = `La media y las diferencias usan: ${select.options[select.selectedIndex]?.textContent || ''}`; };
        select.addEventListener('change', update);
        update();
      }
    }
  };
  run();
  setInterval(run, 800);
  setTimeout(() => {
    const history = document.getElementById('poll-history-range');
    if (history) { history.value = 'all'; history.dispatchEvent(new Event('change', {bubbles:true})); }
  }, 9000);
})();
