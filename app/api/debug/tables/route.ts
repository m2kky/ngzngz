import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const supabase = await createClient()

        // Query information_schema to get all public tables
        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')

        // Since Supabase client might not allow direct access to information_schema depending on permissions,
        // we can also try a raw query if the RPC or direct access is blocked, but let's try this first.
        // Actually, standard Supabase client doesn't support querying information_schema easily without raw SQL 
        // if the types aren't set up, but we can try rpc or just listing known tables.

        // Alternative: Try to select from the tables we expect to see if they exist
        const tablesToCheck = ['projects', 'workspace_members', 'tasks', 'users', 'workspaces']
        const results = {}

        for (const table of tablesToCheck) {
            const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
            results[table] = error ? `Missing or Error: ${error.message}` : 'Exists'
        }

        return NextResponse.json({
            status: "Checked specific tables",
            results
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to check tables" }, { status: 500 })
    }
}
