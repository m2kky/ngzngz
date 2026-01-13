export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          theme: 'light' | 'dark' | 'system'
          background_type: 'color' | 'gradient' | 'image'
          background_value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          theme?: 'light' | 'dark' | 'system'
          background_type?: 'color' | 'gradient' | 'image'
          background_value?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          theme?: 'light' | 'dark' | 'system'
          background_type?: 'color' | 'gradient' | 'image'
          background_value?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          nickname: string | null
          title: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          nickname?: string | null
          title?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          nickname?: string | null
          title?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'strategist' | 'creative' | 'analyst' | 'hr' | 'guest'
          access_scope: 'workspace' | 'client'
          status: 'active' | 'inactive' | 'invited'
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'manager' | 'strategist' | 'creative' | 'analyst' | 'hr' | 'guest'
          access_scope?: 'workspace' | 'client'
          status?: 'active' | 'inactive' | 'invited'
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'strategist' | 'creative' | 'analyst' | 'hr' | 'guest'
          access_scope?: 'workspace' | 'client'
          status?: 'active' | 'inactive' | 'invited'
          joined_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          workspace_id: string
          record_type: string
          record_id: string
          user_id: string
          content: string
          mentioned_user_ids: string[]
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          record_type: string
          record_id: string
          user_id: string
          content: string
          mentioned_user_ids?: string[]
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          record_type?: string
          record_id?: string
          user_id?: string
          content?: string
          mentioned_user_ids?: string[]
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          record_type: string
          record_id: string
          action_type: string
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          record_type: string
          record_id: string
          action_type: string
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          record_type?: string
          record_id?: string
          action_type?: string
          metadata?: Record<string, unknown>
          created_at?: string
        }
      }
    }
  }
}
