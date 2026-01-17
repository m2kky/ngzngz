import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Workspace Context Interface
 * Contains all relevant data about a workspace
 */
export interface WorkspaceContext {
  workspace_id: string
  workspace_name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[]
  userStats: {
    xp_total: number
    xp_weekly: number
    level: number
  }
  teamLeaderboard: Array<{
    user_id: string
    xp_total: number
    level: number
  }>
}

/**
 * جيب كل context الـ workspace (projects, tasks, meetings, stats)
 */
export async function getWorkspaceContext(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>
): Promise<WorkspaceContext> {
  try {
    // 1. جيب workspace_id من workspace_members
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .single()

    if (memberError || !member) {
      throw new Error('User not in any workspace')
    }

    const workspaceId = member.workspace_id

    // 2. جيب workspace name
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', workspaceId)
      .single()

    // 3. جيب كل البيانات بالتوازي
    const [projects, tasks, userStats, leaderboard] = await Promise.all([
      getProjects(workspaceId, supabase),
      getTasks(workspaceId, supabase, 10),
      getUserStats(userId, supabase),
      getTeamLeaderboard(workspaceId, supabase),
    ])

    return {
      workspace_id: workspaceId,
      workspace_name: workspace?.name || 'Unknown',
      projects,
      tasks,
      userStats,
      teamLeaderboard: leaderboard,
    }
  } catch (error) {
    console.error('Error fetching workspace context:', error)
    throw error
  }
}

/**
 * جيب كل المشاريع في الـ workspace
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProjects(
  workspaceId: string,
  supabase: SupabaseClient<any>
) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, progress, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

/**
 * جيب المهام في الـ workspace
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTasks(
  workspaceId: string,
  supabase: SupabaseClient<any>,
  limit: number = 10
) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status, priority, project_id, assignee_id, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

/**
 * جيب إحصائيات المستخدم (XP, Level)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserStats(
  userId: string,
  supabase: SupabaseClient<any>
) {
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('xp_total, xp_weekly, level')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data || { xp_total: 0, xp_weekly: 0, level: 1 }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { xp_total: 0, xp_weekly: 0, level: 1 }
  }
}

/**
 * جيب ترتيب الفريق (Leaderboard)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTeamLeaderboard(
  workspaceId: string,
  supabase: SupabaseClient<any>
) {
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('user_id, xp_total, level')
      .eq('workspace_id', workspaceId)
      .order('xp_total', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

/**
 * جيب بيانات الإعلانات والـ Performance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAdsPerformance(
  workspaceId: string,
  supabase: SupabaseClient<any>
) {
  try {
    const { data, error } = await supabase
      .from('ad_reports')
      .select('id, campaign_name, roas, cpc, impressions, conversions, spend, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching ads performance:', error)
    return []
  }
}

/**
 * جيب تقدم المشروع
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProjectProgress(
  projectId: string,
  supabase: SupabaseClient<any>
) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, progress, status')
      .eq('id', projectId)
      .single()

    if (error) throw error
    return data || null
  } catch (error) {
    console.error('Error fetching project progress:', error)
    return null
  }
}

/**
 * جيب الـ Deadlines القادمة
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUpcomingDeadlines(
  workspaceId: string,
  supabase: SupabaseClient<any>
) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, project_id, status')
      .eq('workspace_id', workspaceId)
      .neq('status', 'done')
      .order('created_at', { ascending: true })
      .limit(5)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching deadlines:', error)
    return []
  }
}

/**
 * جيب الذكريات المحفوظة
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAgentMemories(
  workspaceId: string,
  supabase: SupabaseClient<any>,
  limit: number = 5
) {
  try {
    const { data, error } = await supabase
      .from('sensei_memories')
      .select('content, category, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching memories:', error)
    return []
  }
}
