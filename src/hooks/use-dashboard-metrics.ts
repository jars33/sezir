import { startOfYear, endOfYear, isWithinInterval } from "date-fns"
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
  generateChartData,
  calculateProjectMargins,
  calculateUtilizationProfitability,
  generateForecastData,
  calculateCostBreakdown,
  generateCashFlowData,
  generateYearComparisonData
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
        chartData: [],
        projectMargins: [],
        utilizationProfitabilityData: [],
        forecastData: [],
        costBreakdown: [],
        cashFlowData: [],
        yearComparisonData: []
      }
    }

    // 1. Active Projects - projects that are active during the selected year
    const activeProjects = projects?.filter(project => {
      // Get start and end dates as Date objects
      const projectStart = project.start_date ? new Date(project.start_date) : null
      const projectEnd = project.end_date ? new Date(project.end_date) : null
      
      // Project has no dates set - consider it as not active
      if (!projectStart) return false
      
      // Project with start date but no end date - check if start is before or during the selected year
      if (projectStart && !projectEnd) {
        return projectStart <= yearEnd
      }
      
      // Project with both start and end dates - check if date ranges overlap
      return (
        // Project starts before the year ends AND ends after the year starts
        projectStart <= yearEnd && projectEnd >= yearStart
      )
    }).length || 0

    // 2. Team Members - active team members (not left_company)
    const activeTeamMembers = teamMembers?.filter(member => 
      !member.left_company && 
      (!member.end_date || new Date(member.end_date) >= yearStart)
    ).length || 0

    // 3. Calculate Project Profitability using extracted calculation function
    const avgProjectProfitability = calculateProjectProfitability(
      projects,
      projectRevenues,
      variableCosts,
      overheadCosts,
      allocations,
      selectedYear
    )
    
    // 4. Calculate Resource Utilization using extracted calculation function
    const resourceUtilization = calculateResourceUtilization(
      allocations,
      yearStart,
      yearEnd
    )
    
    // 5. Generate chart data using extracted function
    const chartData = generateChartData(
      selectedYear,
      projectRevenues,
      variableCosts,
      overheadCosts,
      allocations
    )
    
    // 6. Calculate project margins
    const projectMargins = calculateProjectMargins(
      projects,
      projectRevenues,
      variableCosts,
      overheadCosts,
      allocations,
      selectedYear
    )
    
    // 7. Calculate utilization vs profitability
    const utilizationProfitabilityData = calculateUtilizationProfitability(
      projects,
      allocations,
      projectRevenues,
      variableCosts,
      overheadCosts,
      yearStart,
      yearEnd
    )
    
    // 8. Generate forecast data
    const forecastData = generateForecastData(
      selectedYear,
      projectRevenues,
      variableCosts,
      overheadCosts,
      allocations
    )
    
    // 9. Calculate cost breakdown
    const costBreakdown = calculateCostBreakdown(
      variableCosts,
      overheadCosts,
      allocations,
      selectedYear
    )
    
    // 10. Generate cash flow data
    const cashFlowData = generateCashFlowData(
      selectedYear,
      projectRevenues,
      variableCosts,
      overheadCosts,
      allocations
    )
    
    // 11. Generate year comparison data
    const yearComparisonData = generateYearComparisonData(
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
      chartData,
      projectMargins,
      utilizationProfitabilityData,
      forecastData,
      costBreakdown,
      cashFlowData,
      yearComparisonData
    }
  }
  
  const metrics = calculateMetrics()
  
  return {
    metrics,
    isLoading
  }
}
