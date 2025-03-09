import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { getYear, isWithinInterval, startOfYear, endOfYear } from "date-fns"

interface DashboardFilters {
  year?: number;
  teamId?: string | null;
}

export function useDashboardMetrics(filters: DashboardFilters = {}) {
  // Use provided year or default to current year
  const selectedYear = filters.year || new Date().getFullYear()
  const teamId = filters.teamId || null
  const yearStart = startOfYear(new Date(selectedYear, 0))
  const yearEnd = endOfYear(new Date(selectedYear, 0))

  // Fetch team members
  const { data: teamMembers, isLoading: isTeamMembersLoading } = useQuery({
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

  // Fetch projects
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
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

  // Fetch project revenues for profitability calculation
  const { data: projectRevenues, isLoading: isRevenuesLoading } = useQuery({
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

  // Fetch project variable costs for profitability calculation
  const { data: variableCosts, isLoading: isVariableCostsLoading } = useQuery({
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

  // Fetch project overhead costs for profitability calculation
  const { data: overheadCosts, isLoading: isOverheadCostsLoading } = useQuery({
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

  // Fetch allocations for utilization calculation
  const { data: allocations, isLoading: isAllocationsLoading } = useQuery({
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

  // Calculate metrics once all data is loaded
  const isLoading = 
    isTeamMembersLoading || 
    isProjectsLoading || 
    isRevenuesLoading || 
    isVariableCostsLoading || 
    isOverheadCostsLoading ||
    isAllocationsLoading

  // Calculate metrics
  const calculateMetrics = () => {
    if (isLoading) {
      return {
        activeProjects: 0,
        teamMembers: 0,
        avgProjectProfitability: 0,
        resourceUtilization: 0,
        chartData: []
      }
    }

    // 1. Active Projects - projects that are in progress or planned and not ended
    const activeProjects = projects?.filter(project => 
      (project.status === 'in_progress' || project.status === 'planned') && 
      (!project.end_date || new Date(project.end_date) >= new Date())
    ).length || 0

    // 2. Team Members - active team members (not left_company)
    const activeTeamMembers = teamMembers?.filter(member => 
      !member.left_company && 
      (!member.end_date || new Date(member.end_date) >= new Date())
    ).length || 0

    // 3. Calculate Project Profitability
    const projectProfitabilityMap = new Map()
    
    // Initialize with all projects
    projects?.forEach(project => {
      projectProfitabilityMap.set(project.id, {
        revenue: 0,
        variableCosts: 0,
        overheadCosts: 0
      })
    })
    
    // Add revenues
    projectRevenues?.forEach(rev => {
      const revYear = getYear(new Date(rev.month))
      if (revYear === selectedYear && projectProfitabilityMap.has(rev.project_id)) {
        const project = projectProfitabilityMap.get(rev.project_id)
        project.revenue += Number(rev.amount)
        projectProfitabilityMap.set(rev.project_id, project)
      }
    })
    
    // Add variable costs
    variableCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (costYear === selectedYear && projectProfitabilityMap.has(cost.project_id)) {
        const project = projectProfitabilityMap.get(cost.project_id)
        project.variableCosts += Number(cost.amount)
        projectProfitabilityMap.set(cost.project_id, project)
      }
    })
    
    // Add overhead costs
    overheadCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (costYear === selectedYear && projectProfitabilityMap.has(cost.project_id)) {
        const project = projectProfitabilityMap.get(cost.project_id)
        project.overheadCosts += Number(cost.amount)
        projectProfitabilityMap.set(cost.project_id, project)
      }
    })
    
    // Calculate average profitability
    let totalProfitability = 0
    let projectsWithFinancials = 0
    
    projectProfitabilityMap.forEach((data) => {
      const totalCost = data.variableCosts + data.overheadCosts
      // Only count if there's any financial data
      if (data.revenue > 0 || totalCost > 0) {
        // Avoid division by zero
        if (totalCost === 0) {
          totalProfitability += 100 // 100% profit if no costs
        } else {
          const profit = data.revenue - totalCost
          const profitabilityPercent = (profit / totalCost) * 100
          totalProfitability += profitabilityPercent
        }
        projectsWithFinancials++
      }
    })
    
    const avgProjectProfitability = projectsWithFinancials > 0 
      ? Math.round(totalProfitability / projectsWithFinancials) 
      : 0
    
    // 4. Calculate Resource Utilization
    // Group allocations by month and team member
    const monthlyUtilization = new Map()
    
    allocations?.forEach(allocation => {
      const allocDate = new Date(allocation.month)
      if (isWithinInterval(allocDate, { start: yearStart, end: yearEnd })) {
        const monthKey = allocation.month.substr(0, 7) // YYYY-MM format
        const teamMemberId = allocation.project_assignments.team_member_id
        
        if (!monthlyUtilization.has(monthKey)) {
          monthlyUtilization.set(monthKey, new Map())
        }
        
        const memberMap = monthlyUtilization.get(monthKey)
        const currentAllocation = memberMap.get(teamMemberId) || 0
        memberMap.set(teamMemberId, currentAllocation + allocation.allocation_percentage)
      }
    })
    
    let totalUtilization = 0
    let utilizationDataPoints = 0
    
    monthlyUtilization.forEach(memberMap => {
      memberMap.forEach(allocation => {
        // Cap at 100% per person per month
        totalUtilization += Math.min(allocation, 100)
        utilizationDataPoints++
      })
    })
    
    const resourceUtilization = utilizationDataPoints > 0 
      ? Math.round(totalUtilization / utilizationDataPoints) 
      : 0
    
    // Calculate chart data for the selected year
    const chartData = []
    const today = new Date()
    const months = []
    
    // For the selected year, get all months up to the current month if current year
    const monthsToInclude = selectedYear === today.getFullYear()
      ? today.getMonth() + 1 // Current month + 1 (0-indexed)
      : 12
    
    for (let i = 0; i < monthsToInclude; i++) {
      const month = new Date(selectedYear, i, 1)
      const monthName = month.toLocaleString('default', { month: 'short' })
      months.push({ date: month, name: monthName })
    }
    
    // For each month, calculate the revenue and costs
    months.forEach(({ date, name }) => {
      const monthStr = date.toISOString().substr(0, 7) // YYYY-MM
      
      let monthlyRevenue = 0
      projectRevenues?.forEach(rev => {
        if (rev.month.startsWith(monthStr)) {
          monthlyRevenue += Number(rev.amount)
        }
      })
      
      let monthlyCost = 0
      variableCosts?.forEach(cost => {
        if (cost.month.startsWith(monthStr)) {
          monthlyCost += Number(cost.amount)
        }
      })
      
      overheadCosts?.forEach(cost => {
        if (cost.month.startsWith(monthStr)) {
          monthlyCost += Number(cost.amount)
        }
      })
      
      chartData.push({
        month: name,
        revenue: monthlyRevenue,
        cost: monthlyCost
      })
    })
    
    return {
      activeProjects,
      teamMembers: activeTeamMembers,
      avgProjectProfitability,
      resourceUtilization,
      chartData
    }
  }
  
  const metrics = calculateMetrics()
  
  return {
    metrics,
    isLoading
  }
}
