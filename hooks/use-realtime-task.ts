import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useRealtimeTask(taskId: string, onUpdate: (payload: any) => void) {
    const supabase = createClient()

    useEffect(() => {
        if (!taskId || taskId === 'new') return

        const channel = supabase
            .channel(`task-${taskId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tasks',
                    filter: `id=eq.${taskId}`,
                },
                (payload) => {
                    console.log('Realtime update received:', payload)
                    toast.info('Task updated by another user')
                    onUpdate(payload.new)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [taskId, supabase, onUpdate])
}
