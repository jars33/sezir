
// Helper for generating chart data
export function generateChartData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[]
) {
  const chartData = []
  const today = new Date()
  const months = []
  
  // For the selected year, get all months up to the current month if current year
  const monthsToInclude = selectedYear === today.getFullYear()
    ? today.getMonth() + 1 // Current month + 1 (0-indexed)
    : 12
  
  for (let i = 0; i < monthsToInclude; i++) {
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
    
    chartData.push({
      month: name,
      revenue: monthlyRevenue,
      cost: monthlyCost
    })
  })

  return chartData
}
