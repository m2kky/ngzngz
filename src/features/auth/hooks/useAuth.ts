import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for mock user (for E2E tests)
    if (typeof window !== 'undefined' && (window as any).__MOCK_USER__) {
      console.log('Using mock user for testing');
      setUser((window as any).__MOCK_USER__);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string) => {
    // For MVP we can use Magic Link or Password
    // Using Magic Link for simplicity in this example
    return supabase.auth.signInWithOtp({ email })
  }
  
  const signOut = () => supabase.auth.signOut()

  return { user, loading, signIn, signOut }
}
