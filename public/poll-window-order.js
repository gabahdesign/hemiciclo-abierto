'use strict';
(() => {
  const order = ['14','30','45','90','1200'];
  const run = () => {
    const select = document.getElementById('poll-window');
    if (!select) return;
    const selected = select.value;
    order.map(value => [...select.options].find(option => option.value === value)).filter(Boolean).forEach(option => select.append(option));
    const all = [...select.options].find(option => option.value === 'all');
    if (all) select.append(all);
    select.value = selected;
  };
  run();
  setInterval(run, 500);
})();
