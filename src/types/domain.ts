export type GoalStatus='active'|'completed'|'paused'|'archived';
export type TaskStatus='todo'|'in_progress'|'completed'|'cancelled';
export type EnergyLevel='low'|'medium'|'high';
export interface LifeContext {now:string;timezone:string;availableMinutes?:number;energy?:EnergyLevel;currentLocation?:{latitude:number;longitude:number};activeGoals:string[];dueTasks:string[];upcomingEvents:string[];relevantMemories:string[];}
export interface NextOption {id:string;title:string;durationMinutes:number;reason:string;type:'task'|'habit'|'rest'|'activity'|'admin';}
