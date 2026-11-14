import data from '../../data/sondeos.json';
export const dynamic='force-dynamic';
export async function GET(){const blackout=Date.now()>=Date.parse('2026-11-23T23:00:00Z')&&Date.now()<Date.parse('2026-11-29T20:00:00Z');return Response.json(blackout?{updated:data.updated,blackout:true,polls:[],pending:[]}:data,{headers:{'Cache-Control':'no-store'}});}
