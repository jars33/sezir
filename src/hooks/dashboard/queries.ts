
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { useProjectSettings } from "@/hooks/use-project-settings"

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

// Return calculated overhead costs based on variable costs and project settings
export function useOverheadCostsQuery({ selectedYear, teamId, yearStart, yearEnd }: DashboardQueryParams) {
  const { getOverheadPercentage } = useProjectSettings()
  
  // Get variable costs first
  const variableCostsQuery = useVariableCostsQuery({ selectedYear, teamId, yearStart, yearEnd })
  
  return useQuery({
    queryKey: ["project-calculated-overhead-costs", selectedYear, teamId],
    queryFn: async () => {
      // Wait for variable costs to be loaded
      await variableCostsQuery.refetch()
      const variableCosts = variableCostsQuery.data || []
      
      // Group variable costs by project and month
      const costsByProjectAndMonth = variableCosts.reduce<Record<string, Record<string, number>>>((acc, cost) => {
        const projectId = cost.project_id
        const yearMonth = cost.month.substring(0, 7) // Format: YYYY-MM
        
        if (!acc[projectId]) {
          acc[projectId] = {}
        }
        
        acc[projectId][yearMonth] = (acc[projectId][yearMonth] || 0) + Number(cost.amount)
        return acc
      }, {})
      
      // Create calculated overhead costs
      const calculatedOverheadCosts = []
      
      for (const [projectId, monthCosts] of Object.entries(costsByProjectAndMonth)) {
        for (const [month, totalAmount] of Object.entries(monthCosts)) {
          const year = parseInt(month.split('-')[0])
          const percentage = getOverheadPercentage(year)
          const overheadAmount = (totalAmount * percentage) / 100
          
          // Find the project entry to get team_id
          const projectEntry = variableCosts.find(c => c.project_id === projectId)
          
          calculatedOverheadCosts.push({
            id: `calc-overhead-${projectId}-${month}`,
            project_id: projectId,
            month: `${month}-01`, // Set to first day of month
            amount: overheadAmount,
            description: `${percentage}% overhead`,
            isCalculated: true,
            projects: projectEntry ? { team_id: projectEntry.projects.team_id } : null
          })
        }
      }
      
      return calculatedOverheadCosts
    },
    enabled: variableCostsQuery.isSuccess,
  })
}

// Query for allocations - Fixed to correctly return salary cost information
export function useAllocationsQuery({ selectedYear, teamId, yearStart, yearEnd }: DashboardQueryParams) {
  return useQuery({
    queryKey: ["project-allocations-metrics", selectedYear, teamId],
    queryFn: async () => {
      const startDate = yearStart.toISOString().substring(0, 10)
      const endDate = yearEnd.toISOString().substring(0, 10)
      
      // First, get all allocations for the specified date range
      let query = supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments (
            id,
            team_member_id,
            project_id,
            project:projects (
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

      const { data: allocations, error } = await query

      if (error) throw error
      
      // For each allocation, get the team member's salary for that month
      const allocationsWithSalaries = await Promise.all(
        (allocations || []).map(async (allocation) => {
          if (!allocation.project_assignments?.team_member_id) {
            return { ...allocation, salary_cost: 0 }
          }

          const { data: salaryData } = await supabase
            .from("salary_history")
            .select("amount")
            .eq("team_member_id", allocation.project_assignments.team_member_id)
            .lte("start_date", allocation.month)
            .or(`end_date.is.null,end_date.gte.${allocation.month}`)
            .order("start_date", { ascending: false })
            .maybeSingle()

          // Calculate the salary cost based on the allocation percentage
          const monthlySalary = salaryData?.amount || 0
          const salary_cost = (monthlySalary * allocation.allocation_percentage) / 100

          return {
            ...allocation,
            salary_cost
          }
        })
      )

      return allocationsWithSalaries || []
    },
  })
}
