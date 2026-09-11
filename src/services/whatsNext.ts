import {buildContext} from "@/services/context";
import {getBehavior,inferPatterns} from "@/services/behavior";

export type NextOption={title:string;reason:string;minutes:number;score:number;taskId?:string};

export async function getWhatsNext(){
  const c=await buildContext();
  const behavior=await getBehavior(undefined,100);
  const patterns=inferPatterns(behavior);
  const now=new Date(c.now);
  const next=(c.events as any[]).map(e=>({start:new Date(e.starts_at),end:new Date(e.ends_at)})).filter(e=>!Number.isNaN(e.start.getTime())&&e.end>now).sort((a,b)=>a.start.getTime()-b.start.getTime())[0];
  const windowMinutes=next?Math.max(0,Math.round((next.start.getTime()-now.getTime())/60000)):120;
  const options:NextOption[]=(c.tasks as any[]).filter(t=>Number(t.estimated_minutes)>0&&Number(t.estimated_minutes)<=windowMinutes).map(t=>{
    const due=t.due_at?new Date(t.due_at):null;
    const hours=due&&!Number.isNaN(due.getTime())?Math.round((due.getTime()-now.getTime())/3600000):999;
    const urgency=due?Math.max(0,100-Math.max(0,hours)):0;
    const priority=Math.max(1,Math.min(5,Number(t.priority)||3))*15;
    const patternBoost=patterns.some(p=>p.hour===now.getHours())?8:0;
    return {title:String(t.title||"Untitled task"),reason:hours<24?"This is becoming time-sensitive.":"This fits the time you have right now.",minutes:Number(t.estimated_minutes),score:priority+urgency+patternBoost,taskId:t.id};
  });
  if(windowMinutes>=20)options.push({title:"Take a real break",reason:"You have an open window. Rest is a valid use of time.",minutes:Math.min(windowMinutes,30),score:25});
  return {windowMinutes,nextCommitment:next?.start.toISOString()||null,options:options.sort((a,b)=>b.score-a.score).slice(0,3),patterns,context:c};
}
