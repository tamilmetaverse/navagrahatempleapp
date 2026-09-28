import {temples,points} from './data.ts';
export type Settings={base:number;days:number;start:number;end:number;pace:'express'|'normal'|'relaxed';date:string};
export type Stop={index:number;day:number;arrival:number;departure:number;drive:number;wait:number;lunch:boolean};
export type Plan={stops:Stop[];complete:boolean;missing:number[];drive:number;lateReturn:boolean;returns:{day:number;arrival:number;drive:number}[]};
export function hours(index:number,date:string,day:number):[number,number][]{
 const d=new Date(date+'T12:00:00+05:30');d.setUTCDate(d.getUTCDate()+day);const weekday=d.getUTCDay();
 if(index===0&&[0,1,6].includes(weekday))return [[360,780],[960,1260]];
 return temples[index].hours;
}
export function distance(a:{lat:number;lng:number},b:{lat:number;lng:number}){const rad=Math.PI/180;const x=Math.sin((b.lat-a.lat)*rad/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lng-a.lng)*rad/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function estimatedMatrix(){return points.map((a,i)=>points.map((b,j)=>i===j?0:Math.ceil(distance(a,b)*1.4/35*60+8)));}
export function formatTime(v:number){const h=Math.floor(v/60);return `${h%12||12}:${String(v%60).padStart(2,'0')} ${h>=12?'PM':'AM'}`;}
export function planTrip(s:Settings,matrix:number[][],prefix:Stop[]=[],delay=0):Plan{
 if(!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<0||s.end>1439||!Number.isFinite(delay)||delay<0||!Number.isInteger(s.base)||!Number.isFinite(new Date(s.date+'T12:00:00+05:30').getTime())||![1,2,3].includes(s.days)||s.base<9||s.base>=points.length||s.start>=s.end||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!['express','normal','relaxed'].includes(s.pace))throw new Error('Invalid trip settings');
 if(matrix.length!==points.length||matrix.some(r=>r.length!==points.length||r.some(v=>!Number.isFinite(v)||v<0)))throw new Error('Road times are unavailable');
 type State={mask:number;day:number;time:number;loc:number;stops:Stop[];drive:number;wait:number;lunch:boolean};
 const duration={express:30,normal:45,relaxed:65}[s.pace];
 const last=prefix.at(-1);let initial:State={mask:prefix.reduce((m,p)=>m|1<<p.index,0),day:last?.day??0,time:last?last.departure+delay:s.start,loc:last?.index??s.base,stops:prefix,drive:prefix.reduce((a,b)=>a+b.drive,0),wait:0,lunch:!!last&&last.departure>=810};
 let states=[initial],best=initial;
 const count=(x:number)=>x.toString(2).replaceAll('0','').length;
 const rank=(a:State)=>a.day*2000+a.drive+a.wait*.5+a.time*.05;
 for(let depth=prefix.length;depth<9;depth++){
  const next:State[]=[];
  for(const state of states)for(let idx=0;idx<9;idx++){
   if(state.mask&1<<idx)continue;
   for(const newDay of [false,true]){
    const day=state.day+(newDay?1:0);if(day>=s.days)continue;
    if(newDay&&state.time+matrix[state.loc][s.base]>s.end&&state!==initial)continue;
    const origin=newDay?s.base:state.loc;const travel=Math.ceil(matrix[origin][idx]);let arrival=(newDay?s.start:state.time)+travel;let lunch=newDay?false:state.lunch;let tookLunch=false;
    if(!lunch&&arrival+duration>=750){arrival=Math.max(arrival,750)+45;lunch=true;tookLunch=true;}
    let slot:number|undefined;
    for(const [open,close] of hours(idx,s.date,day)){const t=Math.max(arrival,open);if(t+duration+10<=close){slot=t;break;}}
    if(slot===undefined)continue;
    const departure=slot+duration+10;
    if(departure+matrix[idx][s.base]>s.end)continue;
    const st:State={mask:state.mask|1<<idx,day,time:departure,loc:idx,stops:[...state.stops,{index:idx,day,arrival:slot,departure,drive:travel,wait:slot-arrival,lunch:tookLunch}],drive:state.drive+travel+(newDay?Math.ceil(matrix[state.loc][s.base]):0),wait:state.wait+slot-arrival,lunch};next.push(st);
   }
  }
  if(!next.length)break;
  next.sort((a,b)=>rank(a)-rank(b));
  const seen=new Map<string,State>();for(const st of next){const k=`${st.mask}:${st.day}:${st.loc}:${st.lunch}`;const old=seen.get(k);if(!old||st.time<old.time-15)seen.set(k,st);}
  states=[...seen.values()].sort((a,b)=>rank(a)-rank(b)).slice(0,1800);best=states[0];
 }
 const returns=Array.from({length:s.days},(_,day)=>{const st=best.stops.filter(x=>x.day===day).at(-1);return st?{day,arrival:st.departure+Math.ceil(matrix[st.index][s.base])+(last&&st.index===last.index?delay:0),drive:Math.ceil(matrix[st.index][s.base])}:null;}).filter((x):x is {day:number;arrival:number;drive:number}=>!!x);
 return {lateReturn:returns.some(r=>r.arrival>s.end),stops:best.stops,complete:count(best.mask)===9,missing:temples.map((_,i)=>i).filter(i=>!(best.mask&1<<i)),drive:best.stops.reduce((sum,x)=>sum+x.drive,0)+returns.reduce((sum,x)=>sum+x.drive,0),returns};
}
