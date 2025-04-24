
import { startOfYear, endOfYear, isWithinInterval, getYear } from "date-fns"
import { DashboardMetrics } from "./types"
import {
  calculateProjectProfitability,
  calculateResourceUtilization,
  generateDashboardChartData,
  calculateProjectMargins,
  calculateUtilizationProfitability,
  generateForecastData,
  calculateCostBreakdown,
  generateCashFlowData,
  generateYearComparisonData
} from "./calculations"

/**
 * Hook to calculate metrics based on dashboard data
 */
export const useMetricsCalculator = (
  data: {
    teamMembers: any[] | null | undefined;
    projects: any[] | null | undefined;
    projectRevenues: any[] | null | undefined;
    variableCosts: any[] | null | undefined;
    overheadCosts: any[] | null | undefined;
    allocations: any[] | null | undefined;
    teamMemberSalaries: any[] | null | undefined;
  },
  filters: {
    selectedYear: number;
    yearStart: Date;
    yearEnd: Date;
  },
  isLoading: boolean,
  overheadPercentage: number
): DashboardMetrics => {
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

  const { teamMembers, projects, projectRevenues, variableCosts, overheadCosts, allocations, teamMemberSalaries } = data
  const { selectedYear, yearStart, yearEnd } = filters

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

  // 3. Calculate Project Profitability - still using allocations for project-specific calculations
  const avgProjectProfitability = calculateProjectProfitability(
    projects,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    selectedYear,
    overheadPercentage
  )
  
  // 4. Calculate Resource Utilization - using allocations data
  const resourceUtilization = calculateResourceUtilization(
    allocations,
    yearStart,
    yearEnd
  )
  
  // 5. Generate chart data with full team member salaries
  const chartData = generateDashboardChartData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    teamMemberSalaries, // Pass team member salaries instead of allocations
    overheadPercentage,
    true // Use full salaries
  )
  
  // 6. Calculate project margins - still using allocations for project-specific calculations
  const projectMargins = calculateProjectMargins(
    projects,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    selectedYear,
    overheadPercentage
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
  
  // 8. Generate forecast data with full team member salaries
  const forecastData = generateForecastData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    teamMemberSalaries, // Pass team member salaries instead of allocations
    overheadPercentage,
    true // Use full salaries
  )
  
  // 9. Calculate cost breakdown with full team member salaries
  const costBreakdown = calculateCostBreakdown(
    variableCosts,
    overheadCosts,
    teamMemberSalaries, // Pass team member salaries instead of allocations
    selectedYear,
    overheadPercentage,
    true // Use full salaries
  )
  
  // 10. Generate cash flow data with full team member salaries
  const cashFlowData = generateCashFlowData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    teamMemberSalaries, // Pass team member salaries instead of allocations
    overheadPercentage,
    true // Use full salaries
  )
  
  // 11. Generate year comparison data with full team member salaries
  const yearComparisonData = generateYearComparisonData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    teamMemberSalaries, // Pass team member salaries instead of allocations
    overheadPercentage,
    true // Use full salaries
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
