import { create } from 'zustand';
interface SessionState {onboardingComplete:boolean;setOnboardingComplete:(value:boolean)=>void;}
export const useSessionStore=create<SessionState>((set)=>({onboardingComplete:false,setOnboardingComplete:(value)=>set({onboardingComplete:value})}));
