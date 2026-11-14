'use strict';
(() => {
  const colours = {PP:'#0056A8', PSOE:'#E30613', VOX:'#63BE21', SUMAR:'#E51C55', ERC:'#DA4B2C', JUNTS:'#00B7AE', 'EH BILDU':'#B5CF18', PNV:'#00843D', BNG:'#76BCE8'};
  const run = () => {
    const svg = document.getElementById('hero-seats');
    if (!svg || svg.dataset.leftToRight === '1') return;
    const circles = [...svg.querySelectorAll('circle')];
    if (circles.length < 10) return;
    const partySequence = circles.map(c => c.querySelector('title')?.textContent?.trim() || '');
    const positions = [...circles].sort((a,b) => Number(a.getAttribute('cx')) - Number(b.getAttribute('cx')) || Number(a.getAttribute('cy')) - Number(b.getAttribute('cy')));
    positions.forEach((circle, i) => {
      const party = partySequence[i] || 'PP';
      circle.setAttribute('fill', colours[party] || '#858585');
      const title = circle.querySelector('title');
      if (title) title.textContent = party;
    });
    svg.dataset.leftToRight = '1';
  };
  run();
  setTimeout(run, 2200);
  setTimeout(run, 4200);
})();
