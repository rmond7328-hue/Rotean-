import {supabase} from "@/lib/supabase";
export const signInWithEmail=(email:string,password:string)=>supabase.auth.signInWithPassword({email,password});
export const signUpWithEmail=(email:string,password:string,name:string)=>supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
export const signOut=()=>supabase.auth.signOut();
