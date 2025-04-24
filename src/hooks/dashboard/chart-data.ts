
import { format } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData, generateMonthlyFinancialDataWithFullSalaries } from "@/utils/financial-calculations"
import { TeamMemberSalary } from "./types"

// Helper for generating dashboard chart data
export function generateDashboardChartData(
  selectedYear: number,
  projectRevenues: any[] = [],
  variableCosts: any[] = [],
  overheadCosts: any[] = [],
  allocationsOrSalaries: any[] = [],
  overheadPercentage: number = 15,
  useFullSalaries: boolean = false
) {
  const chartData = []
  
  // Use appropriate function based on data type
  const { monthlyData } = useFullSalaries
    ? generateMonthlyFinancialDataWithFullSalaries(
        selectedYear,
        projectRevenues,
        variableCosts,
        allocationsOrSalaries as TeamMemberSalary[],
        overheadPercentage
      )
    : generateMonthlyFinancialData(
        selectedYear,
        projectRevenues,
        variableCosts,
        allocationsOrSalaries,
        overheadPercentage
      )
  
  // Format data for chart display
  for (let i = 0; i < 12; i++) {
    const monthData = monthlyData[i]
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][i]
    const monthName = i18next.t(`common.months.${monthKey}`)
    
    chartData.push({
      month: monthName,
      revenue: monthData.revenue,
      cost: monthData.totalCost,
      profit: monthData.profit
    })
  }
  
  return chartData
}

// Generate chart data specifically for use in charts
export function generateChartData(
  selectedYear: number,
  projectRevenues: any[] = [],
  variableCosts: any[] = [],
  overheadCosts: any[] = [],
  allocationsOrSalaries: any[] = [],
  overheadPercentage: number = 15,
  useFullSalaries: boolean = false
) {
  const chartData = []
  
  // Use appropriate function based on data type
  const { monthlyData } = useFullSalaries
    ? generateMonthlyFinancialDataWithFullSalaries(
        selectedYear,
        projectRevenues,
        variableCosts,
        allocationsOrSalaries as TeamMemberSalary[],
        overheadPercentage
      )
    : generateMonthlyFinancialData(
        selectedYear,
        projectRevenues,
        variableCosts,
        allocationsOrSalaries,
        overheadPercentage
      )
  
  // Format data for chart display - more detailed breakdown
  for (let i = 0; i < 12; i++) {
    const monthData = monthlyData[i]
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][i]
    const monthName = i18next.t(`common.months.${monthKey}`)
    
    chartData.push({
      month: monthName,
      revenue: monthData.revenue,
      variableCost: monthData.variableCost,
      salaryCost: monthData.salaryCost,
      overheadCost: monthData.overheadCost,
      profit: monthData.profit
    })
  }
  
  return chartData
}
