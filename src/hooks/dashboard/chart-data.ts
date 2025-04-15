
import i18next from "i18next"

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
  const baseChartData = generateChartData(
    selectedYear,
    projectRevenues,
    variableCosts,
    overheadCosts,
    allocations
  )
  
  // Apply the overhead percentage correctly using (variableCost + salaryCost) * (1 + overheadPercentage/100)
  return baseChartData.map(monthData => {
    // Get base costs (variable costs and salary costs)
    const baseCosts = monthData.variableCost + monthData.salaryCost
    
    // Apply overhead percentage: (baseCosts) * (1 + overheadPercentage/100)
    // This properly computes total cost with overhead percentage included
    const calculatedOverhead = (baseCosts * overheadPercentage) / 100
    const totalCost = baseCosts + calculatedOverhead + monthData.overheadCost
    
    return {
      ...monthData,
      calculatedOverhead: calculatedOverhead,
      cost: totalCost,
      profit: monthData.revenue - totalCost
    }
  })
}
