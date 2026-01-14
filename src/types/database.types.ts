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
          visibility: 'private' | 'public'
          created_by: string | null
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
          visibility?: 'private' | 'public'
          created_by?: string | null
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
          visibility?: 'private' | 'public'
          created_by?: string | null
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
          status: 'active' | 'inactive' | 'invited'
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          status?: 'active' | 'inactive' | 'invited'
          joined_at?: string
        }
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          status?: 'active' | 'inactive' | 'invited'
          joined_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'guest'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'guest'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'guest'
          created_at?: string
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
      tasks: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string | null
          status: string
          priority: string
          assignee_id: string | null
          due_date: string | null
          content_blocks: Json
          ai_score: number | null
          ai_feedback: string | null
          properties: Json
          rejection_count: number
          last_client_feedback: string | null
          client_view_status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          due_date?: string | null
          content_blocks?: Json
          ai_score?: number | null
          ai_feedback?: string | null
          properties?: Json
          rejection_count?: number
          last_client_feedback?: string | null
          client_view_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          due_date?: string | null
          content_blocks?: Json
          ai_score?: number | null
          ai_feedback?: string | null
          properties?: Json
          rejection_count?: number
          last_client_feedback?: string | null
          client_view_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          workspace_id: string
          email: string
          role: 'owner' | 'admin' | 'member' | 'guest'
          token: string
          status: 'pending' | 'accepted'
          expires_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          role?: 'owner' | 'admin' | 'member' | 'guest'
          token?: string
          status?: 'pending' | 'accepted'
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          role?: 'owner' | 'admin' | 'member' | 'guest'
          token?: string
          status?: 'pending' | 'accepted'
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspace_join_requests: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
          requested_at: string
          responded_at: string | null
          responded_by: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          status?: 'pending' | 'approved' | 'rejected'
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          lookup_token: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
