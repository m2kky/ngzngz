import { createClient } from "@supabase/supabase-js"
import { parseVariables, TriggerPayload } from "./variable-parser"

// This engine is designed to be run server-side (e.g. Edge Function or Next.js API Route)
// It takes a trigger event and payload, finds matching rules, and executes them.

export class AutomationEngine {
    private supabase;

    constructor() {
        // Initialize Supabase Admin Client (requires service_role key for backend execution)
        // In a real app, you'd inject these env vars securely
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    }

    /**
     * Main entry point: Trigger an event
     */
    async trigger(event: string, payload: TriggerPayload) {
        console.log(`[NinjaFlow] Triggered: ${event}`, payload)

        // 1. Find matching active rules for this workspace
        if (!payload.workspace?.id) {
            console.error("[NinjaFlow] No workspace_id in payload")
            return { matched: 0, error: "No workspace_id" }
        }

        const { data: rules, error } = await this.supabase
            .from('automation_rules')
            .select('*')
            .eq('workspace_id', payload.workspace.id)
            .eq('trigger_event', event)
            .eq('is_active', true)

        if (error || !rules) {
            console.error("[NinjaFlow] Error fetching rules", error)
            return { matched: 0, error }
        }

        console.log(`[NinjaFlow] Found ${rules.length} matching rules`)

        // 2. Process each rule
        for (const rule of rules) {
            await this.executeRule(rule, payload)
        }

        return { matched: rules.length, rules: rules.map(r => r.name) }
    }

    /**
     * Execute a single rule
     */
    private async executeRule(rule: any, payload: TriggerPayload) {
        // Check filters (Simple AND logic for now)
        if (rule.filters && Array.isArray(rule.filters)) {
            const passes = rule.filters.every((filter: any) => {
                // TODO: Implement robust filter logic (eq, neq, contains, etc.)
                // For now, assume pass
                return true
            })
            if (!passes) return
        }

        console.log(`[NinjaFlow] Executing Rule: ${rule.name}`)

        // Execute Action Chain
        for (const action of rule.actions_chain) {
            await this.executeAction(action, payload)
        }
    }

    /**
     * Execute a single action
     */
    private async executeAction(action: any, payload: TriggerPayload) {
        console.log(`[NinjaFlow] Running Step ${action.step}: ${action.type}`)

        switch (action.type) {
            case 'send_notification':
                const message = parseVariables(action.config.template, payload)
                // In a real app, call your notification service here
                console.log(`[NinjaFlow] 📧 SENDING NOTIFICATION: "${message}" to ${payload.user?.email}`)
                break

            case 'delay':
                // In a serverless environment, you can't just 'await sleep'.
                // You would typically push this to a queue (e.g. QStash, BullMQ) with a delay.
                // For MVP, we'll just log it.
                console.log(`[NinjaFlow] ⏳ DELAY REQUESTED: ${action.config.duration}`)
                break

            case 'update_record':
                console.log(`[NinjaFlow] 📝 UPDATE RECORD: ${JSON.stringify(action.config)}`)
                break

            default:
                console.warn(`[NinjaFlow] Unknown action type: ${action.type}`)
        }
    }
}
