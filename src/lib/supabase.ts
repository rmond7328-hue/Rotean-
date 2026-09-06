import { createClient } from '@supabase/supabase-js';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if(!url||!anonKey) throw new Error('Missing Supabase environment variables.');
export const supabase=createClient(url,anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
