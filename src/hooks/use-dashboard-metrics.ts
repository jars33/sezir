
import { startOfYear, endOfYear } from "date-fns"
import { 
  useTeamMembersQuery, 
  useProjectsQuery, 
  useProjectRevenuesQuery, 
  useVariableCostsQuery, 
  useOverheadCostsQuery,
  useAllocationsQuery
} from "./dashboard/queries"
import {
  calculateProjectProfitability,
  calculateResourceUtilization,
  generateChartData
} from "./dashboard/calculations"
import { DashboardFilters, DashboardMetrics } from "./dashboard/types"

export function useDashboardMetrics(filters: DashboardFilters = {}) {
  // Use provided year or default to current year
  const selectedYear = filters.year || new Date().getFullYear()
  const teamId = filters.teamId || null
  const yearStart = startOfYear(new Date(selectedYear, 0))
  const yearEnd = endOfYear(new Date(selectedYear, 0))

  // Fetch data using the extracted query hooks
  const { data: teamMembers, isLoading: isTeamMembersLoading } = useTeamMembersQuery(teamId)
  
  const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery(selectedYear, teamId)
  
  const queryParams = { selectedYear, teamId, yearStart, yearEnd }
  
  const { data: projectRevenues, isLoading: isRevenuesLoading } = useProjectRevenuesQuery(queryParams)
  
  const { data: variableCosts, isLoading: isVariableCostsLoading } = useVariableCostsQuery(queryParams)
  
  const { data: overheadCosts, isLoading: isOverheadCostsLoading } = useOverheadCostsQuery(queryParams)
  
  const { data: allocations, isLoading: isAllocationsLoading } = useAllocationsQuery(queryParams)

  // Check if any data is still loading
  const isLoading = 
    isTeamMembersLoading || 
    isProjectsLoading || 
    isRevenuesLoading || 
    isVariableCostsLoading || 
    isOverheadCostsLoading ||
    isAllocationsLoading

  // Calculate metrics
  const calculateMetrics = (): DashboardMetrics => {
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

    // 3. Calculate Project Profitability using extracted calculation function
    const avgProjectProfitability = calculateProjectProfitability(
      projects,
      projectRevenues,
      variableCosts,
      overheadCosts,
      selectedYear
    )
    
    // 4. Calculate Resource Utilization using extracted calculation function
    const resourceUtilization = calculateResourceUtilization(
      allocations,
      yearStart,
      yearEnd
    )
    
    // Generate chart data using extracted function
    const chartData = generateChartData(
      selectedYear,
      projectRevenues,
      variableCosts,
      overheadCosts
    )
    
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
