
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

  const { teamMembers, projects, projectRevenues, variableCosts, overheadCosts, allocations } = data
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

  // 3. Calculate Project Profitability using extracted calculation function
  const avgProjectProfitability = calculateProjectProfitability(
    projects,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    selectedYear,
    overheadPercentage  // Pass overhead percentage
  )
  
  // 4. Calculate Resource Utilization using extracted calculation function
  const resourceUtilization = calculateResourceUtilization(
    allocations,
    yearStart,
    yearEnd
  )
  
  // 5. Generate chart data using extracted function WITH overhead percentage
  const chartData = generateDashboardChartData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    overheadPercentage
  )
  
  // 6. Calculate project margins - Pass the overhead percentage
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
  
  // 8. Generate forecast data - Pass the overhead percentage
  const forecastData = generateForecastData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    overheadPercentage
  )
  
  // 9. Calculate cost breakdown
  const costBreakdown = calculateCostBreakdown(
    variableCosts,
    overheadCosts,
    allocations,
    selectedYear,
    overheadPercentage
  )
  
  // 10. Generate cash flow data
  const cashFlowData = generateCashFlowData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    overheadPercentage
  )
  
  // 11. Generate year comparison data
  const yearComparisonData = generateYearComparisonData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations,
    overheadPercentage
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
