
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { getYear, isWithinInterval, startOfYear, endOfYear } from "date-fns"

export function useDashboardMetrics() {
  // Current year for calculations
  const currentYear = new Date().getFullYear()
  const yearStart = startOfYear(new Date(currentYear, 0))
  const yearEnd = endOfYear(new Date(currentYear, 0))

  // Fetch team members
  const { data: teamMembers, isLoading: isTeamMembersLoading } = useQuery({
    queryKey: ["team-members-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  // Fetch projects
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  // Fetch project revenues for profitability calculation
  const { data: projectRevenues, isLoading: isRevenuesLoading } = useQuery({
    queryKey: ["project-revenues-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_revenues")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  // Fetch project variable costs for profitability calculation
  const { data: variableCosts, isLoading: isVariableCostsLoading } = useQuery({
    queryKey: ["project-variable-costs-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_variable_costs")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  // Fetch project overhead costs for profitability calculation
  const { data: overheadCosts, isLoading: isOverheadCostsLoading } = useQuery({
    queryKey: ["project-overhead-costs-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_overhead_costs")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  // Fetch allocations for utilization calculation
  const { data: allocations, isLoading: isAllocationsLoading } = useQuery({
    queryKey: ["project-allocations-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments!inner (
            team_member_id
          )
        `)

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
        monthlyRevenue: [],
        monthlyCost: []
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
      if (revYear === currentYear && projectProfitabilityMap.has(rev.project_id)) {
        const project = projectProfitabilityMap.get(rev.project_id)
        project.revenue += Number(rev.amount)
        projectProfitabilityMap.set(rev.project_id, project)
      }
    })
    
    // Add variable costs
    variableCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (costYear === currentYear && projectProfitabilityMap.has(cost.project_id)) {
        const project = projectProfitabilityMap.get(cost.project_id)
        project.variableCosts += Number(cost.amount)
        projectProfitabilityMap.set(cost.project_id, project)
      }
    })
    
    // Add overhead costs
    overheadCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (costYear === currentYear && projectProfitabilityMap.has(cost.project_id)) {
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
    
    // Calculate chart data for the last 6 months
    const chartData = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = month.toLocaleString('default', { month: 'short' })
      
      // Calculate revenue and cost for this month
      const monthStr = month.toISOString().substr(0, 7) // YYYY-MM
      
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
        month: monthName,
        revenue: monthlyRevenue,
        cost: monthlyCost
      })
    }
    
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
