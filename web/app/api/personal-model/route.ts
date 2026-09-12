import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPersonalModel } from "@/lib/intelligence/personalModel";

export async function GET(){try{const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"You need to be signed in."},{status:401});return NextResponse.json({model:await getPersonalModel()})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to build personal model."},{status:500})}}
