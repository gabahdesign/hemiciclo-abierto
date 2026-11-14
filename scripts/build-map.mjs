import fs from 'node:fs';
const geo=JSON.parse(fs.readFileSync('../spain-provinces.geojson','utf8'));
const aliases={'Araba/Álava':'ÁLAVA','Alacant/Alicante':'ALICANTE','Castelló/Castellón':'CASTELLÓN','Gipuzkoa/Guipúzcoa':'GIPUZKOA','València/Valencia':'VALENCIA','Bizkaia/Vizcaya':'BIZKAIA'};
const parties=JSON.parse(fs.readFileSync('public/candidaturas.json','utf8'))[2026],provinces=new Set(parties.map(p=>p.province));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const project=([lon,lat],island)=>island?[65+(lon+18.3)*42,515+(29.5-lat)*43]:[55+(lon+9.5)*47,30+(44-lat)*59];
const svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 650" aria-label="Selecciona una de las 52 circunscripciones" role="group"><rect class="island-box" x="30" y="490" width="285" height="138" rx="0"/><text class="map-inset-label" x="45" y="510">CANARIAS · RECUADRO A OTRA ESCALA</text>'];
const labelPoints=[];
for(const f of geo.features){const name=aliases[f.properties.name]||f.properties.name.toUpperCase(),island=['LAS PALMAS','SANTA CRUZ DE TENERIFE'].includes(name);if(!provinces.has(name))throw Error('Unknown map province '+name);
 const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 let path='',bestArea=0,center=[0,0];
 for(const poly of polys)for(const [index,ring]of poly.entries()){
  const points=ring.map(p=>project(p,island));let kept=[points[0]];for(let i=1;i<points.length;i++){const prev=kept.at(-1);if(Math.hypot(points[i][0]-prev[0],points[i][1]-prev[1])>1)kept.push(points[i]);}if(kept.length<3)kept=points;
  path+=kept.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(1)).join(',')).join('')+'Z';
  if(index===0){let area=0,cx=0,cy=0;for(let i=0;i<points.length-1;i++){const[a,b]=[points[i],points[i+1]],v=a[0]*b[1]-b[0]*a[1];area+=v;cx+=(a[0]+b[0])*v;cy+=(a[1]+b[1])*v;}if(Math.abs(area)>bestArea){bestArea=Math.abs(area);center=[cx/(3*area),cy/(3*area)];}}
 }
 const label=f.properties.name.split('/').find(n=>n.toUpperCase()===name)||f.properties.name.split('/')[0];
 svg.push(`<path class="map-province" data-province="${esc(name)}" d="${path}" role="button" tabindex="0" aria-label="${esc(label)}" aria-pressed="false"><title>${esc(label)}</title></path>`);
 if(!['CEUTA','MELILLA'].includes(name))labelPoints.push(`<text class="map-label" data-label-province="${esc(name)}" x="${center[0].toFixed(1)}" y="${center[1].toFixed(1)}" text-anchor="middle">${esc(label)}</text>`);
}
svg.push(...labelPoints);
for(const [province,x]of [['CEUTA',395],['MELILLA',555]])svg.push(`<g class="map-city" data-province="${province}" role="button" tabindex="0" aria-label="${province}" aria-pressed="false"><rect x="${x}" y="572" width="140" height="46"/><text x="${x+70}" y="600" text-anchor="middle">${province} ↗</text></g>`);
svg.push('</svg>');fs.writeFileSync('public/spain-provinces.svg',svg.join(''));
fs.writeFileSync('public/map-attribution.txt',`Map adapted from Click That Hood / CartoDB Common Data.\nhttps://github.com/codeforgermany/click_that_hood/blob/main/public/data/spain-provinces.geojson\nMIT License\nCopyright (c) 2013-2021 Code for America\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\nGeometry simplified for interface selection only. Not for legal boundary determination. Canary Islands shown in an inset at another scale. Ceuta and Melilla also have enlarged buttons.\n`);
if(geo.features.length!==52)throw Error('Expected 52 provinces');console.log('Mapa generado: 52 provincias asociadas al catálogo electoral.');
