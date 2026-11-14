import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('public'),mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const json=(res,value)=>{res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/participacion'){json(res,{enabled:false,local:true,signedIn:false,counts:{},total:0,updated:new Date().toISOString()});return;}
  if(url.pathname==='/api/sondeos'){const data=JSON.parse(fs.readFileSync('app/data/sondeos.json','utf8')),blackout=Date.now()>=Date.parse('2026-11-23T23:00:00Z')&&Date.now()<Date.parse('2026-11-29T20:00:00Z');json(res,blackout?{updated:data.updated,blackout:true,polls:[],pending:[]}:data);return;}
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/ui.html':decodeURIComponent(url.pathname)));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'text/plain','Cache-Control':'no-store'});res.end(content);
 }catch{if(!res.headersSent)res.writeHead(404);res.end('No encontrado');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
