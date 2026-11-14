import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { getDb } from '../../../db';
import { responses } from '../../../db/schema';
import { eq, lt } from 'drizzle-orm';
import data from '../../data/candidaturas.json';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
async function key(){const u=await getChatGPTUser(); if(!u)return null;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(u.userId+':29N2026')))].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function prune(){await getDb().delete(responses).where(lt(responses.created,new Date(Date.now()-90*86400000).toISOString()));}
export async function GET(){
 const config=env as unknown as Record<string,string|undefined>;const enabled=config.POLL_ENABLED==='true'&&!!(config.POLL_CONTROLLER&&config.POLL_CONTACT);const blackout=Date.now()>=Date.parse('2026-11-23T23:00:00Z')&&Date.now()<Date.parse('2026-11-29T20:00:00Z');
 try{await prune();const k=await key();const all=await getDb().select().from(responses);const counts:Record<string,number>={};const volumes:Record<string,number>={};for(const r of all)volumes[r.province]=(volumes[r.province]||0)+1;for(const r of all)if(!blackout&&volumes[r.province]>=10)counts[r.party]=(counts[r.party]||0)+1;
 return json({enabled,blackout,controller:config.POLL_CONTROLLER||null,contact:config.POLL_CONTACT||null,signedIn:!!k,mine:all.find(r=>r.account===k)?.party||null,counts,total:Object.values(counts).reduce((a,b)=>a+b,0),updated:new Date().toISOString()});
 }catch{return json({error:'No se ha podido cargar la encuesta. Inténtalo de nuevo.'},503);}
}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origen no permitido'},403);
 const config=env as unknown as Record<string,string|undefined>;
 if(config.POLL_ENABLED!=='true'||!config.POLL_CONTROLLER||!config.POLL_CONTACT)return json({error:'Participación real pendiente de revisión y activación.'},403);
 if(Date.now()>=Date.parse('2026-11-23T23:00:00Z'))return json({error:'Encuesta cerrada antes del periodo de prohibición de difusión de sondeos.'},403);
 const k=await key();if(!k)return json({error:'Inicia sesión para participar.'},401);
 let body;try{body=await req.json() as {party?:string;consent?:boolean;adult?:boolean};}catch{return json({error:'Solicitud no válida'},400);}
 const p=data['2026'].find(p=>p.id===body.party);const special=['blanco','nulo','abstencion','indeciso'].find(s=>body.party?.startsWith(s+':'));
 const province=special?body.party!.split(':')[1]:p?.province;
 if(body.consent!==true||body.adult!==true||!province||(!p&&!special)||(special&&body.party!==special+':'+province)||!data['2026'].some(p=>p.province===province))return json({error:'Revisa provincia, candidatura y consentimiento.'},400);
 await prune();
 const result=await getDb().insert(responses).values({account:k,party:body.party!,province,created:new Date().toISOString(),consent:'v1'}).onConflictDoNothing().returning({account:responses.account});
 if(!result.length)return json({error:'Esta cuenta ya ha participado. Puedes retirar tu respuesta desde Privacidad.'},409);
 return json({ok:true},201);
}
export async function PUT(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origen no permitido'},403);
 const config=env as unknown as Record<string,string|undefined>;
 if(config.POLL_ENABLED!=='true'||!config.POLL_CONTROLLER||!config.POLL_CONTACT)return json({error:'Participación real pendiente de revisión y activación.'},403);
 if(Date.now()>=Date.parse('2026-11-23T23:00:00Z'))return json({error:'Encuesta cerrada.'},403);
 const k=await key();if(!k)return json({error:'Inicia sesión para participar.'},401);
 let body;try{body=await req.json() as {party?:string;consent?:boolean;adult?:boolean};}catch{return json({error:'Solicitud no válida'},400);}
 const p=data['2026'].find(p=>p.id===body.party),special=['blanco','nulo','abstencion','indeciso'].find(s=>body.party?.startsWith(s+':'));
 const province=special?body.party!.split(':')[1]:p?.province;
 if(body.consent!==true||body.adult!==true||!province||(!p&&!special)||(special&&body.party!==special+':'+province)||!data['2026'].some(p=>p.province===province))return json({error:'Revisa provincia, candidatura y consentimiento.'},400);
 await prune();
 const updated=await getDb().update(responses).set({party:body.party!,province,created:new Date().toISOString(),consent:'v1'}).where(eq(responses.account,k)).returning({account:responses.account});
 return updated.length?json({ok:true}):json({error:'No hay una respuesta activa para modificar.'},404);
}
export async function DELETE(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origen no permitido'},403);
 const k=await key();if(!k)return json({error:'Inicia sesión'},401);
 await getDb().delete(responses).where(eq(responses.account,k));return json({ok:true});
}
