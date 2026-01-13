import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface PresenceState {
    [key: string]: any
}

export function usePresence(channelName: string, user: User | null) {
    const [presence, setPresence] = useState<PresenceState>({})
    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel(channelName)

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState()
                setPresence(newState)
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('join', key, newPresences)
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('leave', key, leftPresences)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        email: user.email,
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            channel.unsubscribe()
        }
    }, [user, channelName, supabase])

    return presence
}
