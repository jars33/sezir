
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

interface DashboardQueryParams {
  selectedYear: number
  teamId: string | null
  yearStart: Date
  yearEnd: Date
}

// Query for team members
export function useTeamMembersQuery(teamId: string | null) {
  return useQuery({
    queryKey: ["team-members-metrics", teamId],
    queryFn: async () => {
      let query = supabase
        .from("team_members")
        .select("*, team_memberships!inner(team_id)")
      
      if (teamId) {
        query = query.eq("team_memberships.team_id", teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}

// Query for projects
export function useProjectsQuery(selectedYear: number, teamId: string | null) {
  return useQuery({
    queryKey: ["projects-metrics", selectedYear, teamId],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*")
      
      if (teamId) {
        query = query.eq("team_id", teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}

// Query for project revenues
export function useProjectRevenuesQuery({ selectedYear, teamId, yearStart, yearEnd }: DashboardQueryParams) {
  return useQuery({
    queryKey: ["project-revenues-metrics", selectedYear, teamId],
    queryFn: async () => {
      const startDate = yearStart.toISOString().substring(0, 10)
      const endDate = yearEnd.toISOString().substring(0, 10)
      
      let query = supabase
        .from("project_revenues")
        .select("*, projects!inner(id, team_id)")
        .gte("month", startDate)
        .lte("month", endDate)
      
      if (teamId) {
        query = query.eq("projects.team_id", teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}

// Query for project variable costs
export function useVariableCostsQuery({ selectedYear, teamId, yearStart, yearEnd }: DashboardQueryParams) {
  return useQuery({
    queryKey: ["project-variable-costs-metrics", selectedYear, teamId],
    queryFn: async () => {
      const startDate = yearStart.toISOString().substring(0, 10)
      const endDate = yearEnd.toISOString().substring(0, 10)
      
      let query = supabase
        .from("project_variable_costs")
        .select("*, projects!inner(id, team_id)")
        .gte("month", startDate)
        .lte("month", endDate)
      
      if (teamId) {
        query = query.eq("projects.team_id", teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}

// Query for project overhead costs
export function useOverheadCostsQuery({ selectedYear, teamId, yearStart, yearEnd }: DashboardQueryParams) {
  return useQuery({
    queryKey: ["project-overhead-costs-metrics", selectedYear, teamId],
    queryFn: async () => {
      const startDate = yearStart.toISOString().substring(0, 10)
      const endDate = yearEnd.toISOString().substring(0, 10)
      
      let query = supabase
        .from("project_overhead_costs")
        .select("*, projects!inner(id, team_id)")
        .gte("month", startDate)
        .lte("month", endDate)
      
      if (teamId) {
        query = query.eq("projects.team_id", teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}

// Query for allocations
export function useAllocationsQuery({ selectedYear, teamId, yearStart, yearEnd }: DashboardQueryParams) {
  return useQuery({
    queryKey: ["project-allocations-metrics", selectedYear, teamId],
    queryFn: async () => {
      const startDate = yearStart.toISOString().substring(0, 10)
      const endDate = yearEnd.toISOString().substring(0, 10)
      
      let query = supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments!inner (
            team_member_id,
            project_id,
            project:projects!inner(
              id,
              team_id
            )
          )
        `)
        .gte("month", startDate)
        .lte("month", endDate)
      
      if (teamId) {
        query = query.eq("project_assignments.project.team_id", teamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}
