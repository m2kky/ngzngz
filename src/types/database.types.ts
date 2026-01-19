export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          record_id: string
          record_type: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          record_id: string
          record_type: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          record_id?: string
          record_type?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_integrations: {
        Row: {
          client_id: string
          created_at: string | null
          credentials: Json
          id: string
          platform: string
          settings: Json | null
          status: string | null
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          credentials: Json
          id?: string
          platform?: string
          settings?: Json | null
          status?: string | null
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          credentials?: Json
          id?: string
          platform?: string
          settings?: Json | null
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_integrations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          client_id: string
          colors: Json | null
          created_at: string | null
          guidelines: Json | null
          id: string
          name: string
          typography: Json | null
          updated_at: string | null
          voice_sliders: Json | null
          workspace_id: string
        }
        Insert: {
          client_id: string
          colors?: Json | null
          created_at?: string | null
          guidelines?: Json | null
          id?: string
          name: string
          typography?: Json | null
          updated_at?: string | null
          voice_sliders?: Json | null
          workspace_id: string
        }
        Update: {
          client_id?: string
          colors?: Json | null
          created_at?: string | null
          guidelines?: Json | null
          id?: string
          name?: string
          typography?: Json | null
          updated_at?: string | null
          voice_sliders?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          custom_properties: Json | null
          id: string
          logo_url: string | null
          name: string
          notes_doc: Json | null
          owner_id: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          slug: string
          social_links: Json | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          website: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          custom_properties?: Json | null
          id?: string
          logo_url?: string | null
          name: string
          notes_doc?: Json | null
          owner_id?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          custom_properties?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
          notes_doc?: Json | null
          owner_id?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          website?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string | null
          id: string
          mentioned_user_ids: string[] | null
          record_id: string
          record_type: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          content: string
          created_at?: string | null
          id?: string
          mentioned_user_ids?: string[] | null
          record_id: string
          record_type: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string | null
          id?: string
          mentioned_user_ids?: string[] | null
          record_id?: string
          record_type?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          role: string
          status: string
          token: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          access_scope: Database["public"]["Enums"]["access_scope"]
          allowed_client_ids: string[] | null
          created_at: string | null
          created_by: string | null
          email: string | null
          expires_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          role_id: string | null
          token: string
          used_at: string | null
          workspace_id: string
        }
        Insert: {
          access_scope?: Database["public"]["Enums"]["access_scope"]
          allowed_client_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          role_id?: string | null
          token: string
          used_at?: string | null
          workspace_id: string
        }
        Update: {
          access_scope?: Database["public"]["Enums"]["access_scope"]
          allowed_client_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          role_id?: string | null
          token?: string
          used_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_assets: {
        Row: {
          created_at: string | null
          file_type: string | null
          id: string
          meeting_id: string
          name: string
          size_bytes: number | null
          uploader_id: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          id?: string
          meeting_id: string
          name: string
          size_bytes?: number | null
          uploader_id?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          id?: string
          meeting_id?: string
          name?: string
          size_bytes?: number | null
          uploader_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_assets_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendees: {
        Row: {
          created_at: string | null
          id: string
          meeting_id: string
          role: string | null
          speaking_topic: string | null
          status: Database["public"]["Enums"]["attendee_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_id: string
          role?: string | null
          speaking_topic?: string | null
          status?: Database["public"]["Enums"]["attendee_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_id?: string
          role?: string | null
          speaking_topic?: string | null
          status?: Database["public"]["Enums"]["attendee_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          attachments: Json | null
          body_doc: Json | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          custom_properties: Json | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_link: string | null
          project_id: string | null
          recording_link: string | null
          start_time: string
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          attachments?: Json | null
          body_doc?: Json | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_properties?: Json | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string | null
          recording_link?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          attachments?: Json | null
          body_doc?: Json | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_properties?: Json | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          project_id?: string | null
          recording_link?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          body_doc: Json | null
          client_id: string | null
          created_at: string | null
          custom_properties: Json | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          owner_id: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          body_doc?: Json | null
          client_id?: string | null
          created_at?: string | null
          custom_properties?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          body_doc?: Json | null
          client_id?: string | null
          created_at?: string | null
          custom_properties?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      property_definitions: {
        Row: {
          created_at: string | null
          default_value: Json | null
          description: string | null
          id: string
          is_required: boolean | null
          key: string
          label: string
          options: string[] | null
          record_type: string
          type: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          key: string
          label: string
          options?: string[] | null
          record_type: string
          type: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          default_value?: Json | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          key?: string
          label?: string
          options?: string[] | null
          record_type?: string
          type?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_definitions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          name: string
          permissions: Json
          slug: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name: string
          permissions?: Json
          slug?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name?: string
          permissions?: Json
          slug?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_views: {
        Row: {
          columns: Json | null
          created_at: string | null
          filters: Json | null
          group_by: string | null
          id: string
          name: string
          record_type: string
          sort: Json | null
          updated_at: string | null
          view_type: string
          workspace_id: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          filters?: Json | null
          group_by?: string | null
          id?: string
          name: string
          record_type: string
          sort?: Json | null
          updated_at?: string | null
          view_type: string
          workspace_id: string
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          filters?: Json | null
          group_by?: string | null
          id?: string
          name?: string
          record_type?: string
          sort?: Json | null
          updated_at?: string | null
          view_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_views_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          action: string | null
          buyer_personas: Json | null
          client_id: string
          control: string | null
          created_at: string
          id: string
          objectives: string | null
          situation: string | null
          status: string
          strategy: string | null
          tactics: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          action?: string | null
          buyer_personas?: Json | null
          client_id: string
          control?: string | null
          created_at?: string
          id?: string
          objectives?: string | null
          situation?: string | null
          status?: string
          strategy?: string | null
          tactics?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          action?: string | null
          buyer_personas?: Json | null
          client_id?: string
          control?: string | null
          created_at?: string
          id?: string
          objectives?: string | null
          situation?: string | null
          status?: string
          strategy?: string | null
          tactics?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      task_statuses: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_default: boolean
          name: string
          position: number
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          position?: number
          slug: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          position?: number
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          archived_at: string | null
          assignee_id: string | null
          assignee_ids: string[] | null
          body_doc: Json | null
          client_id: string | null
          client_view_status: string | null
          completed_at: string | null
          content_blocks: Json | null
          created_at: string | null
          created_by: string | null
          custom_properties: Json | null
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          id: string
          internal_revision_count: number | null
          is_ad_ready: boolean | null
          last_client_feedback: string | null
          parent_task_id: string | null
          persona_id: string | null
          phase: string | null
          platform: Database["public"]["Enums"]["platform_type"] | null
          priority: string | null
          project_id: string | null
          publish_date: string | null
          rejection_count: number | null
          smart_canvas: Json | null
          sort_order: number | null
          start_date: string | null
          status: string
          tags: string[] | null
          template_id: string | null
          time_spent_minutes: number | null
          title: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          archived_at?: string | null
          assignee_id?: string | null
          assignee_ids?: string[] | null
          body_doc?: Json | null
          client_id?: string | null
          client_view_status?: string | null
          completed_at?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          created_by?: string | null
          custom_properties?: Json | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          internal_revision_count?: number | null
          is_ad_ready?: boolean | null
          last_client_feedback?: string | null
          parent_task_id?: string | null
          persona_id?: string | null
          phase?: string | null
          platform?: Database["public"]["Enums"]["platform_type"] | null
          priority?: string | null
          project_id?: string | null
          publish_date?: string | null
          rejection_count?: number | null
          smart_canvas?: Json | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          template_id?: string | null
          time_spent_minutes?: number | null
          title: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          archived_at?: string | null
          assignee_id?: string | null
          assignee_ids?: string[] | null
          body_doc?: Json | null
          client_id?: string | null
          client_view_status?: string | null
          completed_at?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          created_by?: string | null
          custom_properties?: Json | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          internal_revision_count?: number | null
          is_ad_ready?: boolean | null
          last_client_feedback?: string | null
          parent_task_id?: string | null
          persona_id?: string | null
          phase?: string | null
          platform?: Database["public"]["Enums"]["platform_type"] | null
          priority?: string | null
          project_id?: string | null
          publish_date?: string | null
          rejection_count?: number | null
          smart_canvas?: Json | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          template_id?: string | null
          time_spent_minutes?: number | null
          title?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          nickname: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          nickname?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          nickname?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workspace_invites: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          role: string
          status: string | null
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          role: string
          status?: string | null
          token: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          role?: string
          status?: string | null
          token?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_join_requests: {
        Row: {
          created_at: string | null
          id: string
          responded_at: string | null
          responded_by: string | null
          status: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_join_requests_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_join_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string | null
          role_id: string | null
          status: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role_id?: string | null
          status?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role_id?: string | null
          status?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          background_type: string | null
          background_value: string | null
          created_at: string | null
          created_by: string | null
          id: string
          logo_url: string | null
          meeting_property_definitions: Json | null
          name: string
          slug: string
          theme: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          background_type?: string | null
          background_value?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          meeting_property_definitions?: Json | null
          name: string
          slug: string
          theme?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          background_type?: string | null
          background_value?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          meeting_property_definitions?: Json | null
          name?: string
          slug?: string
          theme?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_workspace_complete: {
        Args: {
          p_name: string
          p_slug: string
          p_visibility: string
        }
        Returns: string
      }
      get_my_workspace_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_permissions: {
        Args: {
          p_user_id: string
          p_workspace_id: string
        }
        Returns: Json
      }
      handle_workspace_setup: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      is_workspace_admin: {
        Args: {
          _workspace_id: string
        }
        Returns: boolean
      }
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      access_scope: "workspace" | "client"
      attendee_status: "PENDING" | "ACCEPTED" | "DECLINED"
      meeting_status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
      platform_type: "Instagram" | "TikTok" | "LinkedIn" | "YouTube"
      squad_role: "LEAD" | "CREATIVE" | "COPYWRITER" | "STRATEGIST" | "MEDIA_BUYER"
      task_priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      task_status:
        | "DRAFTING"
        | "IN_PROGRESS"
        | "AI_CHECK"
        | "INTERNAL_REVIEW"
        | "CLIENT_REVIEW"
        | "APPROVED"
        | "PUBLISHED"
        | "ADS_HANDOFF"
      user_role:
        | "SYSTEM_ADMIN"
        | "ACCOUNT_MANAGER"
        | "SQUAD_MEMBER"
        | "MEDIA_BUYER"
        | "EXTERNAL_CLIENT"
        | "FREELANCER"
      workspace_status: "ACTIVE" | "ARCHIVED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
