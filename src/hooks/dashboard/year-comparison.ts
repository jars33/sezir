
import { getYear } from "date-fns"

// Generate year-over-year comparison data
export function generateYearComparisonData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[]
) {
  const yearComparisonData = []
  const currentYear = selectedYear
  const previousYear = selectedYear - 1
  
  // For the selected year, include all months
  const months = []
  for (let i = 0; i < 12; i++) {
    const month = new Date(currentYear, i, 1)
    const monthName = month.toLocaleString('default', { month: 'short' })
    months.push({ date: month, name: monthName })
  }
  
  // Helper function to calculate monthly financials
  const calculateMonthlyFinancials = (year, monthIndex) => {
    const monthDate = new Date(year, monthIndex, 1)
    const monthStr = monthDate.toISOString().substr(0, 7) // YYYY-MM
    
    let revenue = 0
    projectRevenues?.forEach(rev => {
      const revYear = getYear(new Date(rev.month))
      if (revYear === year && rev.month.startsWith(monthStr)) {
        revenue += Number(rev.amount)
      }
    })
    
    let variableCost = 0
    variableCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (costYear === year && cost.month.startsWith(monthStr)) {
        variableCost += Number(cost.amount)
      }
    })
    
    let overheadCost = 0
    overheadCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (costYear === year && cost.month.startsWith(monthStr)) {
        overheadCost += Number(cost.amount)
      }
    })
    
    const totalCost = variableCost + overheadCost
    const profit = revenue - totalCost
    
    return { revenue, profit }
  }
  
  // For each month, calculate current and previous year financials
  months.forEach(({ name }, index) => {
    const currentYearData = calculateMonthlyFinancials(currentYear, index)
    const previousYearData = calculateMonthlyFinancials(previousYear, index)
    
    yearComparisonData.push({
      month: name,
      currentYearRevenue: currentYearData.revenue,
      previousYearRevenue: previousYearData.revenue,
      currentYearProfit: currentYearData.profit,
      previousYearProfit: previousYearData.profit
    })
  })

  return yearComparisonData
}
