import { NextResponse } from "next/server";
import { createClient }  from "@/lib/supabaseClient";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { name, createdBy } = await request.json();
    const { data, error } = await supabase.from("workspaces").insert({ name, createdBy });
    
    if (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
    
    return new Response(JSON.stringify(data), { status: 201 });
}

