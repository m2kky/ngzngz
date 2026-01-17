import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for mock user (for E2E tests)
    const mockUser = typeof window !== 'undefined' ? (window as any).__MOCK_USER__ : null;
    if (mockUser) {
      console.log('Using mock user for testing');
      setTimeout(() => {
        setUser(mockUser as any);
        setLoading(false);
      }, 0);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password?: string) => {
    if (password) {
      return supabase.auth.signInWithPassword({ email, password })
    }
    // Fallback to Magic Link if no password provided (legacy support)
    return supabase.auth.signInWithOtp({ email })
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
  }

  const sendOtp = async (email: string) => {
    return supabase.auth.signInWithOtp({ email })
  }

  const verifyOtp = async (email: string, token: string, type: 'email' | 'signup' = 'email') => {
    return supabase.auth.verifyOtp({
      email,
      token,
      type: type as 'email' | 'signup',
    })
  }

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
  }

  const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const signOut = () => supabase.auth.signOut()

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    sendOtp,
    verifyOtp,
    resetPassword,
    signInWithGoogle
  }
}
