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
            users: {
                Row: {
                    id: string
                    email: string
                    password_hash: string
                    full_name: string
                    nickname: string | null
                    role: 'SYSTEM_ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'EXTERNAL_CLIENT' | 'FREELANCER'
                    avatar_url: string | null
                    theme_color: string
                    birth_date: string | null
                    bio: string | null
                    xp_points: number
                    weekly_xp: number
                    ninja_level: number
                    badges: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    password_hash: string
                    full_name: string
                    nickname?: string | null
                    role?: 'SYSTEM_ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'EXTERNAL_CLIENT' | 'FREELANCER'
                    avatar_url?: string | null
                    theme_color?: string
                    birth_date?: string | null
                    bio?: string | null
                    xp_points?: number
                    weekly_xp?: number
                    ninja_level?: number
                    badges?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    password_hash?: string
                    full_name?: string
                    nickname?: string | null
                    role?: 'SYSTEM_ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'EXTERNAL_CLIENT' | 'FREELANCER'
                    avatar_url?: string | null
                    theme_color?: string
                    birth_date?: string | null
                    bio?: string | null
                    xp_points?: number
                    weekly_xp?: number
                    ninja_level?: number
                    badges?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    slug: string
                    logo_url: string | null
                    status: 'active' | 'inactive' | 'archived'
                    primary_contact_name: string | null
                    primary_contact_email: string | null
                    primary_contact_phone: string | null
                    website: string | null
                    created_at: string
                    updated_at: string
                    archived_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    slug: string
                    logo_url?: string | null
                    status?: 'active' | 'inactive' | 'archived'
                    primary_contact_name?: string | null
                    primary_contact_email?: string | null
                    primary_contact_phone?: string | null
                    website?: string | null
                    created_at?: string
                    updated_at?: string
                    archived_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    slug?: string
                    logo_url?: string | null
                    status?: 'active' | 'inactive' | 'archived'
                    primary_contact_name?: string | null
                    primary_contact_email?: string | null
                    primary_contact_phone?: string | null
                    website?: string | null
                    created_at?: string
                    updated_at?: string
                    archived_at?: string | null
                }
            }
            achievements: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    xp_reward: number
                    icon_url: string | null
                    category: string
                    requirement_type: string | null
                    requirement_value: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    xp_reward?: number
                    icon_url?: string | null
                    category?: string
                    requirement_type?: string | null
                    requirement_value?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    xp_reward?: number
                    icon_url?: string | null
                    category?: string
                    requirement_type?: string | null
                    requirement_value?: number | null
                    created_at?: string
                }
            }
            workspaces: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    logo_url: string | null
                    branding_config: Json
                    status: 'ACTIVE' | 'ARCHIVED'
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    logo_url?: string | null
                    branding_config?: Json
                    status?: 'ACTIVE' | 'ARCHIVED'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    logo_url?: string | null
                    branding_config?: Json
                    status?: 'ACTIVE' | 'ARCHIVED'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            meetings: {
                Row: {
                    id: string
                    workspace_id: string
                    client_id: string | null
                    project_id: string | null
                    title: string
                    description: string | null
                    start_time: string
                    end_time: string
                    location: string | null
                    meeting_link: string | null
                    recording_link: string | null
                    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
                    body_doc: Json
                    custom_properties: Json
                    attachments: Json
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    client_id?: string | null
                    project_id?: string | null
                    title: string
                    description?: string | null
                    start_time: string
                    end_time: string
                    location?: string | null
                    meeting_link?: string | null
                    recording_link?: string | null
                    status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
                    body_doc?: Json
                    custom_properties?: Json
                    attachments?: Json
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    client_id?: string | null
                    project_id?: string | null
                    title?: string
                    description?: string | null
                    start_time?: string
                    end_time?: string
                    location?: string | null
                    meeting_link?: string | null
                    recording_link?: string | null
                    status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
                    body_doc?: Json
                    custom_properties?: Json
                    attachments?: Json
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            meeting_attendees: {
                Row: {
                    id: string
                    meeting_id: string
                    user_id: string
                    role: string | null
                    speaking_topic: string | null
                    status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
                    created_at: string
                }
                Insert: {
                    id?: string
                    meeting_id: string
                    user_id: string
                    role?: string | null
                    speaking_topic?: string | null
                    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED'
                    created_at?: string
                }
                Update: {
                    id?: string
                    meeting_id?: string
                    user_id?: string
                    role?: string | null
                    speaking_topic?: string | null
                    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED'
                    created_at?: string
                }
            }
            task_statuses: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    slug: string
                    color: string | null
                    icon: string | null
                    position: number
                    is_default: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    slug: string
                    color?: string | null
                    icon?: string | null
                    position?: number
                    is_default?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    slug?: string
                    color?: string | null
                    icon?: string | null
                    position?: number
                    is_default?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    workspace_id: string
                    title: string
                    description: string | null
                    status: string // Changed from ENUM to string for dynamic statuses
                    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                    assignee_id: string | null
                    persona_id: string | null
                    template_id: string | null
                    content_blocks: Json
                    smart_canvas: Json
                    is_ad_ready: boolean
                    due_date: string | null
                    project_id: string | null
                    ai_score: number | null
                    ai_feedback: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    publish_date: string | null
                    platform: 'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube' | null
                    estimated_cost: number | null
                    archived_at: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    title: string
                    description?: string | null
                    status?: string
                    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                    assignee_id?: string | null
                    persona_id?: string | null
                    template_id?: string | null
                    content_blocks?: Json
                    smart_canvas?: Json
                    is_ad_ready?: boolean
                    due_date?: string | null
                    project_id?: string | null
                    ai_score?: number | null
                    ai_feedback?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    publish_date?: string | null
                    platform?: 'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube' | null
                    estimated_cost?: number | null
                    archived_at?: string | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    title?: string
                    description?: string | null
                    status?: string
                    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                    assignee_id?: string | null
                    persona_id?: string | null
                    template_id?: string | null
                    content_blocks?: Json
                    smart_canvas?: Json
                    is_ad_ready?: boolean
                    due_date?: string | null
                    project_id?: string | null
                    ai_score?: number | null
                    ai_feedback?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    publish_date?: string | null
                    platform?: 'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube' | null
                    estimated_cost?: number | null
                    archived_at?: string | null
                }
            }
            personas: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    avatar_url: string | null
                    description: string | null
                    pain_points: string[]
                    tone_keywords: string[]
                    demographics: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    avatar_url?: string | null
                    description?: string | null
                    pain_points?: string[]
                    tone_keywords?: string[]
                    demographics?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    avatar_url?: string | null
                    description?: string | null
                    pain_points?: string[]
                    tone_keywords?: string[]
                    demographics?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            squads: {
                Row: {
                    id: string
                    workspace_id: string
                    user_id: string
                    role_in_squad: 'LEAD' | 'CREATIVE' | 'COPYWRITER' | 'STRATEGIST' | 'MEDIA_BUYER'
                    joined_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    user_id: string
                    role_in_squad?: 'LEAD' | 'CREATIVE' | 'COPYWRITER' | 'STRATEGIST' | 'MEDIA_BUYER'
                    joined_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    user_id?: string
                    role_in_squad?: 'LEAD' | 'CREATIVE' | 'COPYWRITER' | 'STRATEGIST' | 'MEDIA_BUYER'
                    joined_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    description: string | null
                    status: string
                    start_date: string | null
                    end_date: string | null
                    project_owner_id: string | null
                    created_at: string
                    updated_at: string
                    total_budget: number | null
                    spent_budget: number | null
                    client_health: 'Happy' | 'Neutral' | 'At Risk' | null
                    client_id: string | null
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    description?: string | null
                    status?: string
                    start_date?: string | null
                    end_date?: string | null
                    project_owner_id?: string | null
                    created_at?: string
                    updated_at?: string
                    total_budget?: number | null
                    spent_budget?: number | null
                    client_health?: 'Happy' | 'Neutral' | 'At Risk' | null
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    description?: string | null
                    status?: string
                    start_date?: string | null
                    end_date?: string | null
                    project_owner_id?: string | null
                    created_at?: string
                    updated_at?: string
                    total_budget?: number | null
                    spent_budget?: number | null
                    client_health?: 'Happy' | 'Neutral' | 'At Risk' | null
                }
            }
            reports: {
                Row: {
                    id: string
                    workspace_id: string
                    project_id: string | null
                    title: string
                    status: 'DRAFT' | 'PUBLISHED'
                    public_token: string
                    slides_config: Json
                    ai_summary: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    project_id?: string | null
                    title: string
                    status?: 'DRAFT' | 'PUBLISHED'
                    public_token?: string
                    slides_config?: Json
                    ai_summary?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    project_id?: string | null
                    title?: string
                    status?: 'DRAFT' | 'PUBLISHED'
                    public_token?: string
                    slides_config?: Json
                    ai_summary?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            report_feedback: {
                Row: {
                    id: string
                    report_id: string
                    rating: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | null
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    report_id: string
                    rating?: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | null
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    report_id?: string
                    rating?: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | null
                    comment?: string | null
                    created_at?: string
                }
            }
            workspace_invites: {
                Row: {
                    id: string
                    workspace_id: string
                    email: string
                    role: 'ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'CLIENT'
                    status: 'PENDING' | 'ACCEPTED'
                    token: string
                    created_by: string | null
                    created_at: string
                    expires_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    email: string
                    role?: 'ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'CLIENT'
                    status?: 'PENDING' | 'ACCEPTED'
                    token: string
                    created_by?: string | null
                    created_at?: string
                    expires_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    email?: string
                    role?: 'ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'CLIENT'
                    status?: 'PENDING' | 'ACCEPTED'
                    token?: string
                    created_by?: string | null
                    created_at?: string
                    expires_at?: string
                }
            }
            integrations: {
                Row: {
                    id: string
                    workspace_id: string
                    platform: 'META' | 'TIKTOK' | 'GOOGLE'
                    access_token: string
                    ad_account_id: string
                    status: 'ACTIVE' | 'ERROR' | 'DISCONNECTED'
                    last_synced_at: string | null
                    error_message: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    platform: 'META' | 'TIKTOK' | 'GOOGLE'
                    access_token: string
                    ad_account_id: string
                    status?: 'ACTIVE' | 'ERROR' | 'DISCONNECTED'
                    last_synced_at?: string | null
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    platform?: 'META' | 'TIKTOK' | 'GOOGLE'
                    access_token?: string
                    ad_account_id?: string
                    status?: 'ACTIVE' | 'ERROR' | 'DISCONNECTED'
                    last_synced_at?: string | null
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            activity_logs: {
                Row: {
                    id: string
                    workspace_id: string
                    user_id: string
                    record_type: string
                    record_id: string
                    action_type: string
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    user_id: string
                    record_type: string
                    record_id: string
                    action_type: string
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    user_id?: string
                    record_type?: string
                    record_id?: string
                    action_type?: string
                    metadata?: Json
                    created_at?: string
                }
            },
            strategies: {
                Row: {
                    id: string
                    workspace_id: string
                    client_id: string
                    title: string
                    status: string
                    situation: string | null
                    objectives: string | null
                    strategy: string | null
                    tactics: string | null
                    action: string | null
                    control: string | null
                    buyer_personas: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    client_id: string
                    title: string
                    status?: string
                    situation?: string | null
                    objectives?: string | null
                    strategy?: string | null
                    tactics?: string | null
                    action?: string | null
                    control?: string | null
                    buyer_personas?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    client_id?: string
                    title?: string
                    status?: string
                    situation?: string | null
                    objectives?: string | null
                    strategy?: string | null
                    tactics?: string | null
                    action?: string | null
                    control?: string | null
                    buyer_personas?: Json
                    created_at?: string
                    updated_at?: string
                }
            },
            brand_kits: {
                Row: {
                    id: string
                    workspace_id: string
                    client_id: string
                    name: string
                    voice_sliders: Json
                    colors: Json
                    typography: Json
                    guidelines: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    client_id: string
                    name: string
                    voice_sliders?: Json
                    colors?: Json
                    typography?: Json
                    guidelines?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    client_id?: string
                    name?: string
                    voice_sliders?: Json
                    colors?: Json
                    typography?: Json
                    guidelines?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'SYSTEM_ADMIN' | 'ACCOUNT_MANAGER' | 'SQUAD_MEMBER' | 'MEDIA_BUYER' | 'EXTERNAL_CLIENT' | 'FREELANCER'
            workspace_status: 'ACTIVE' | 'ARCHIVED'
            task_status: 'DRAFTING' | 'IN_PROGRESS' | 'AI_CHECK' | 'INTERNAL_REVIEW' | 'CLIENT_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ADS_HANDOFF'
            task_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
            squad_role: 'LEAD' | 'CREATIVE' | 'COPYWRITER' | 'STRATEGIST' | 'MEDIA_BUYER'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
