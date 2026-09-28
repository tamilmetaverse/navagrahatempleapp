import snapshot from '@/lib/navagraha/road-snapshot.json';
import {points} from '@/lib/navagraha/data';
let cache:{at:number;matrix:number[][]}|null=null;
export async function GET(){
 if(cache&&Date.now()-cache.at<3600000)return Response.json({...cache,source:'OSRM road estimates · no live traffic'});
 try{const coords=points.map(x=>`${x.lng},${x.lat}`).join(';');const r=await fetch(`https://router.project-osrm.org/table/v1/driving/${coords}?annotations=duration`,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();const d=await r.json() as {code:string;durations:(number|null)[][]};if(d.code!=='Ok'||d.durations.some(row=>row.some(x=>x===null)))throw Error();cache={at:Date.now(),matrix:d.durations.map(row=>row.map(x=>Math.ceil(x!/60*1.2+5)))};return Response.json({...cache,source:'OSRM road estimates · no live traffic'});}catch{return Response.json({...snapshot,source:'OSRM road snapshot from 28 September 2026 · no live traffic'});}
}
