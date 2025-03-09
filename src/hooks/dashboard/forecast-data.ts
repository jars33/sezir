
import { addMonths, format } from "date-fns"

// Generate forecast data based on historical trends
export function generateForecastData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[]
) {
  const forecastData = []
  const currentDate = new Date()
  const isCurrentYear = selectedYear === currentDate.getFullYear()
  
  // For the selected year, include all months
  const months = []
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1)
    const monthName = month.toLocaleString('default', { month: 'short' })
    months.push({ date: month, name: monthName })
  }
  
  // Current month index (0-based)
  const currentMonthIndex = isCurrentYear ? currentDate.getMonth() : 11
  
  // Calculate average monthly growth rates from available data
  const revenueGrowthRate = calculateGrowthRate(projectRevenues, selectedYear)
  const costGrowthRate = calculateGrowthRate([...variableCosts, ...overheadCosts], selectedYear)
  
  // For each month, calculate actual or projected data
  months.forEach(({ date, name }, index) => {
    const monthStr = date.toISOString().substr(0, 7) // YYYY-MM
    const isPastMonth = index <= currentMonthIndex && isCurrentYear
    
    let actualRevenue = 0
    let actualCost = 0
    
    // Calculate actuals for past months
    if (isPastMonth) {
      projectRevenues?.forEach(rev => {
        if (rev.month.startsWith(monthStr)) {
          actualRevenue += Number(rev.amount)
        }
      })
      
      variableCosts?.forEach(cost => {
        if (cost.month.startsWith(monthStr)) {
          actualCost += Number(cost.amount)
        }
      })
      
      overheadCosts?.forEach(cost => {
        if (cost.month.startsWith(monthStr)) {
          actualCost += Number(cost.amount)
        }
      })
    }
    
    // Calculate projections
    let projectedRevenue = null
    let projectedCost = null
    
    if (!isPastMonth) {
      // For future months, project based on the last actual month or continue the projection
      if (index === currentMonthIndex + 1) {
        // First projection month is based on the last actual month
        const lastActualRevenue = forecastData[currentMonthIndex]?.actualRevenue || 0
        const lastActualCost = forecastData[currentMonthIndex]?.actualCost || 0
        
        projectedRevenue = lastActualRevenue * (1 + revenueGrowthRate)
        projectedCost = lastActualCost * (1 + costGrowthRate)
      } else if (index > currentMonthIndex + 1) {
        // Later projection months are based on previous projections
        const prevProjectedRevenue = forecastData[index - 1]?.projectedRevenue || 0
        const prevProjectedCost = forecastData[index - 1]?.projectedCost || 0
        
        projectedRevenue = prevProjectedRevenue * (1 + revenueGrowthRate)
        projectedCost = prevProjectedCost * (1 + costGrowthRate)
      }
    }
    
    forecastData.push({
      month: name,
      actualRevenue: isPastMonth ? actualRevenue : null,
      actualCost: isPastMonth ? actualCost : null,
      projectedRevenue: projectedRevenue,
      projectedCost: projectedCost,
    })
  })

  return forecastData
}

// Helper to calculate monthly growth rate
function calculateGrowthRate(financialData: any[], selectedYear: number) {
  // Group by month
  const monthlyTotals = new Map()
  
  financialData?.forEach(item => {
    const itemDate = new Date(item.month)
    const itemYear = itemDate.getFullYear()
    
    if (itemYear === selectedYear) {
      const monthKey = format(itemDate, 'yyyy-MM')
      const currentTotal = monthlyTotals.get(monthKey) || 0
      monthlyTotals.set(monthKey, currentTotal + Number(item.amount))
    }
  })
  
  // Convert to array and sort by month
  const sortedMonthData = Array.from(monthlyTotals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
  
  // Need at least 2 months of data to calculate growth
  if (sortedMonthData.length < 2) {
    return 0.02 // Default to 2% monthly growth if insufficient data
  }
  
  // Calculate average month-over-month growth
  let totalGrowthRate = 0
  let countedMonths = 0
  
  for (let i = 1; i < sortedMonthData.length; i++) {
    const prevMonth = sortedMonthData[i - 1][1]
    const currentMonth = sortedMonthData[i][1]
    
    if (prevMonth > 0) {
      const monthGrowth = (currentMonth - prevMonth) / prevMonth
      totalGrowthRate += monthGrowth
      countedMonths++
    }
  }
  
  const avgGrowthRate = countedMonths > 0 
    ? totalGrowthRate / countedMonths 
    : 0.02 // Default to 2% if can't calculate
  
  // Limit growth rate to reasonable bounds
  return Math.max(-0.3, Math.min(avgGrowthRate, 0.3))
}
