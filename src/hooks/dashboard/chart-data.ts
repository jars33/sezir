
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
    
    // Add allocation costs
    allocations?.forEach(allocation => {
      if (allocation.month.startsWith(monthStr) && allocation.salary_cost) {
        monthlyCost += Number(allocation.salary_cost)
      }
    })
    
    chartData.push({
      month: name,
      revenue: monthlyRevenue,
      cost: monthlyCost
    })
  })

  return chartData
}
