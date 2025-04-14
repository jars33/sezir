
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
    
    // Add explicit overhead costs
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
  
  // Apply the overhead percentage to each month's variable costs
  // Handle decimal percentages correctly
  return baseChartData.map(monthData => {
    // Calculate the calculated overhead based on the percentage
    const calculatedOverhead = (monthData.variableCost * overheadPercentage) / 100
    
    // Update the cost to include the calculated overhead
    const totalCost = monthData.cost + calculatedOverhead
    
    return {
      ...monthData,
      calculatedOverhead,
      cost: totalCost,
      profit: monthData.revenue - totalCost
    }
  })
}
