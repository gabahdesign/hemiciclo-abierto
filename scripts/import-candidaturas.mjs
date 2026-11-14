import fs from 'node:fs';
const clean=s=>s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\s+/g,' ').trim();
const groups={
'Andalucía':'ALMERÍA,CÁDIZ,CÓRDOBA,GRANADA,HUELVA,JAÉN,MÁLAGA,SEVILLA',
'Aragón':'HUESCA,TERUEL,ZARAGOZA','Asturias':'ASTURIAS','Illes Balears':'ILLES BALEARS,BALEARES','Canarias':'LAS PALMAS,SANTA CRUZ DE TENERIFE','Cantabria':'CANTABRIA','Castilla-La Mancha':'ALBACETE,CIUDAD REAL,CUENCA,GUADALAJARA,TOLEDO','Castilla y León':'ÁVILA,BURGOS,LEÓN,PALENCIA,SALAMANCA,SEGOVIA,SORIA,VALLADOLID,ZAMORA','Cataluña':'BARCELONA,GIRONA,LLEIDA,TARRAGONA','Comunitat Valenciana':'ALICANTE,CASTELLÓN,VALENCIA','Extremadura':'BADAJOZ,CÁCERES','Galicia':'A CORUÑA,CORUÑA,LUGO,OURENSE,PONTEVEDRA','Comunidad de Madrid':'MADRID','Región de Murcia':'MURCIA','Navarra':'NAVARRA','País Vasco':'ÁLAVA,ARABA/ÁLAVA,BIZKAIA,GIPUZKOA','La Rioja':'LA RIOJA','Ceuta':'CEUTA','Melilla':'MELILLA'};
function parse(file,year){
 const html=fs.readFileSync(file,'utf8');const output=[];let province='',chamber='',current=null;
 for(const m of html.matchAll(/<p\b[^>]*class="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g)){
  const text=clean(m[2]);
  if(text.startsWith('JUNTA ELECTORAL DE ')){province=text.slice(19).replace(/^LA PROVINCIA DE /,'');if(province==='BALEARES')province='ILLES BALEARS';chamber='';current=null;}
  if(text==='CONGRESO DE LOS DIPUTADOS'){chamber='congreso';current=null;}
  if(text==='SENADO'){chamber='senado';current=null;}
  if(province&&chamber==='congreso'&&m[1]==='centro_redonda'&&/^\d+[.\s]/.test(text)){
   const name=text.replace(/^\d+[.\s]+/,''); const region=Object.entries(groups).find(([,v])=>v.split(',').includes(province))?.[0]||'Sin clasificar';
   current={id:year+'-'+output.length,province,region,name,short:name.match(/\(([^()]*)\)\s*$/)?.[1]||name,year};output.push(current);
  }
  if(current&&/No proclamada/i.test(text)){output.splice(output.indexOf(current),1);current=null;}
 }
 return output.map((p,i)=>({...p,id:year+'-'+i}));
}
const data={2023:parse('../boe.html',2023),2026:parse('../BOE-A-2026-23103.html',2026)};
// Correcciones oficiales del 4 y 7 de julio de 2023 (solo cambios de listas, no personas).
for(const p of data[2023]){
 if(p.province==='ILLES BALEARS'&&p.name.includes('SUMAR MÉS')){p.name='SUMAR MÉS (MÉS PER MALLORCA-MÉS PER MENORCA-SUMAR)';p.short='MÉS PER MALLORCA-MÉS PER MENORCA-SUMAR';}
 if(p.province==='BIZKAIA'&&p.name.startsWith('PARTIDO SOCIALISTA DE')){p.name='PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA (PSOE) PSE-EE (PSOE)';p.short='PSE-EE (PSOE)';}
}
if(!data[2023].some(p=>p.province==='TERUEL'&&p.short==='PACMA'))data[2023].push({id:'2023-pacma-teruel',province:'TERUEL',region:'Aragón',name:'PARTIDO ANIMALISTA CON EL MEDIO AMBIENTE (PACMA)',short:'PACMA',year:2023});
for(const list of Object.values(data))for(const p of list){
 const n=p.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 const exact={
 'PARTIDO POPULAR (PP)':'PP','PARTIT POPULAR / PARTIDO POPULAR (PP)':'PP',
 'PARTIDO SOCIALISTA OBRERO ESPANOL (PSOE)':'PSOE',
 'PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE) (PSC)':'PSC-PSOE',
 'PARTIDO SOCIALISTA DE EUSKADI-EUSKADIKO EZKERRA (PSOE) PSE-EE (PSOE)':'PSE-EE (PSOE)',
 'PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE (PSDEG-PSOE)':'PSdeG-PSOE',
 'PARTIDO SOCIALISTA DE NAVARRA-PSOE (PSN-PSOE)':'PSN-PSOE',
 'PARTIDO SOCIALISTA DE HUELVA (PSOE)':'PSOE · Huelva',
 'EUSKAL HERRIA BILDU (EH BILDU)':'EH BILDU',
 'EUZKO ALDERDI JELTZALEA-PARTIDO NACIONALISTA VASCO (EAJ-PNV)':'EAJ-PNV',
 'JUNTS PER CATALUNYA (JXCAT)':'JUNTS',
 'ESQUERRA REPUBLICANA DE CATALUNYA (ERC)':'ERC',
 'BLOQUE NACIONALISTA GALEGO (B.N.G.)':'BNG','BLOQUE NACIONALISTA GALEGO (BNG)':'BNG',
 'UNION DEL PUEBLO NAVARRO EN COALICION CON EL PARTIDO POPULAR (UPN-PP)':'UPN-PP',
 'EUSKAL HERRIA BILDU-ESQUERRA REPUBLICANA DE CATALUNYA (EH BILDU-ERC)':'EH BILDU-ERC',
 'FRENTE OBRERO':'FO','FRENTE OBRERO (FO)':'FO',
 'PODEMOS':'PODEMOS','PODEMOS (PODEMOS)':'PODEMOS','PODEMOS (PAZ,CASA Y TRABAJO)':'PODEMOS · PAZ, CASA Y TRABAJO',
 'FRENTE AMPLIO (FA)':'FRENTE AMPLIO','FRENTE AMPLIO ANDALUZ (FA)':'FRENTE AMPLIO ANDALUZ','FRENTE AMPLIU POR ASTURIES (FA)':'FRENTE AMPLIU POR ASTURIES',
 'FRENTE AMPLIO-FRONTE AMPLA (FRENTE AMPLIO-FRONTE AMPLA)':'FRENTE AMPLIO-FRONTE AMPLA',
 'FRENTE AMPLIO - FRONTE AMPLA (FRENTE AMPLIO - FRONTE AMPLA)':'FRENTE AMPLIO-FRONTE AMPLA',
 'COALICION CANARIA-MUNICIPALISTAS PRIMERO CANARIAS (CCA-1.ºCAN)':'CCa-1.ºCAN',
 'MUNICIPALISTAS PRIMERO CANARIAS-COALICION CANARIA (1.ºCAN-CCA)':'1.ºCAN-CCa',
 };
 p.group=exact[n]||p.short.toUpperCase();
}
fs.mkdirSync('app/data',{recursive:true});fs.writeFileSync('app/data/candidaturas.json',JSON.stringify(data,null,2));
const numbers=['','Uno','Dos','Tres','Cuatro','Cinco','Seis','Siete','Ocho','Nueve','Diez','Once','Doce','Trece','Catorce','Quince','Dieciséis','Diecisiete','Dieciocho','Diecinueve','Veinte'];
const aliases={'Alicante/Alacant':'ALICANTE','Araba/Álava':'ÁLAVA','Castellón/Castelló':'CASTELLÓN','Coruña (A)':'A CORUÑA','Rioja (La)':'LA RIOJA','Palmas (Las)':'LAS PALMAS','Balears (Illes)':'BALEARES','Valencia/València':'VALENCIA'};
const seats={};for(const m of fs.readFileSync('../BOE-A-2026-20742.html','utf8').matchAll(/<tr>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>/gs)){
 const p=clean(m[1]).replace(/\.$/,''); const n=clean(m[2]).replace(/\.$/,'');const num=n==='Treinta y siete'?37:n==='Treinta y dos'?32:n==='Treinta y tres'?33:n==='Treinta y ocho'?38:n==='Treinta y nueve'?39:numbers.indexOf(n);
 seats[(aliases[p]||p.toUpperCase())==='BALEARES'?'ILLES BALEARS':(aliases[p]||p.toUpperCase())]=num;
}fs.writeFileSync('app/data/seats.json',JSON.stringify(seats,null,2));console.log('Escaños:',Object.values(seats).reduce((a,b)=>a+b,0),seats);
for(const [y,v] of Object.entries(data)){console.log(y,v.length,'listas',new Set(v.map(x=>x.province)).size,'provincias', [...new Set(v.filter(x=>x.region==='Sin clasificar').map(x=>x.province))]);}
