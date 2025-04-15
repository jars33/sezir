
import { getYear } from "date-fns"
import i18next from "i18next"

// Generate year-over-year comparison data
export function generateYearComparisonData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  overheadPercentage: number = 15 // Add overhead percentage parameter
) {
  const yearComparisonData = []
  const currentYear = selectedYear
  const previousYear = selectedYear - 1
  
  // For the selected year, include all months
  const months = []
  for (let i = 0; i < 12; i++) {
    const month = new Date(currentYear, i, 1)
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()]
    const monthName = i18next.t(`common.months.${monthKey}`)
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
    
    // Instead of explicit overhead costs, calculate based on the overhead percentage
    let salaryCost = 0
    allocations?.forEach(allocation => {
      const allocYear = getYear(new Date(allocation.month))
      if (allocYear === year && allocation.month.startsWith(monthStr) && allocation.salary_cost) {
        salaryCost += Number(allocation.salary_cost)
      }
    })
    
    // Calculate base costs
    const baseCosts = variableCost + salaryCost
    
    // Calculate overhead costs using the percentage
    const calculatedOverheadCosts = (baseCosts * overheadPercentage) / 100
    
    // Calculate total cost: base costs + calculated overhead costs
    const totalCost = baseCosts + calculatedOverheadCosts
    
    // Calculate profit
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
