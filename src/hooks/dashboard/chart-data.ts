
import i18next from "i18next"
import { generateMonthlyFinancialData } from "@/utils/financial-calculations"

// Helper for generating chart data
export function generateChartData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[]
) {
  const chartData = []
  const months = []
  
  // Always include all 12 months of the selected year
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1)
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()]
    const monthName = i18next.t(`common.months.${monthKey}`)
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
    
    let monthlyVariableCost = 0
    variableCosts?.forEach(cost => {
      if (cost.month.startsWith(monthStr)) {
        monthlyVariableCost += Number(cost.amount)
      }
    })
    
    // Add explicit overhead costs (directly entered in the system)
    let monthlyExplicitOverheadCost = 0
    overheadCosts?.forEach(cost => {
      if (cost.month.startsWith(monthStr)) {
        monthlyExplicitOverheadCost += Number(cost.amount)
      }
    })
    
    // Add allocation costs
    let monthlySalaryCost = 0
    allocations?.forEach(allocation => {
      if (allocation.month.startsWith(monthStr) && allocation.salary_cost) {
        monthlySalaryCost += Number(allocation.salary_cost)
      }
    })
    
    // Total cost includes variable costs, explicit overhead costs, and salary costs
    // But doesn't include the overhead percentage calculation which is added in generateDashboardChartData
    const monthlyCost = monthlyVariableCost + monthlyExplicitOverheadCost + monthlySalaryCost
    
    chartData.push({
      month: name,
      revenue: monthlyRevenue,
      cost: monthlyCost,
      variableCost: monthlyVariableCost,
      overheadCost: monthlyExplicitOverheadCost,
      salaryCost: monthlySalaryCost
    })
  })

  return chartData
}

// Function specifically for dashboard that includes calculated overhead based on project settings
export function generateDashboardChartData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  overheadPercentage: number
) {
  // Use the centralized monthly data generation function
  const { monthlyData } = generateMonthlyFinancialData(
    selectedYear, 
    projectRevenues, 
    variableCosts, 
    allocations, 
    overheadPercentage
  );
  
  // Transform the data to match the expected format for the dashboard
  const months = []
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1)
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()]
    const monthName = i18next.t(`common.months.${monthKey}`)
    months.push({ date: month, name: monthName })
  }
  
  return monthlyData.map((data, index) => {
    return {
      month: months[index].name,
      revenue: data.revenue,
      cost: data.totalCost,
      profit: data.profit,
      variableCost: data.variableCost,
      salaryCost: data.salaryCost,
      calculatedOverhead: data.overheadCost,
      overheadCost: 0, // Explicit overhead costs (not used in centralized calculation)
    }
  });
}
