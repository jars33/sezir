
import { addMonths, format } from "date-fns"

export function generateForecastData(
  selectedYear: number,
  projectRevenues: any[] = [],
  variableCosts: any[] = [],
  overheadCosts: any[] = [],
  allocations: any[] = []
) {
  // Initialize with empty arrays if inputs are undefined
  projectRevenues = projectRevenues || []
  variableCosts = variableCosts || []
  overheadCosts = overheadCosts || []
  allocations = allocations || []
  
  const forecastData = []
  const currentDate = new Date()
  const isCurrentYear = selectedYear === currentDate.getFullYear()
  
  // Always include all 12 months of the selected year
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
  
  let lastActualRevenue = 0
  let lastActualCost = 0
  
  // For each month, calculate actual or projected data
  months.forEach(({ date, name }, index) => {
    const monthStr = date.toISOString().substr(0, 7) // YYYY-MM
    const isPastMonth = index <= currentMonthIndex && isCurrentYear
    
    let actualRevenue = 0
    let actualCost = 0
    let projectedRevenue = null
    let projectedCost = null
    
    if (isPastMonth) {
      // Calculate actuals for past months
      projectRevenues?.forEach(rev => {
        if (rev && rev.month && rev.month.startsWith(monthStr)) {
          actualRevenue += Number(rev.amount || 0)
        }
      })
      
      variableCosts?.forEach(cost => {
        if (cost && cost.month && cost.month.startsWith(monthStr)) {
          actualCost += Number(cost.amount || 0)
        }
      })
      
      overheadCosts?.forEach(cost => {
        if (cost && cost.month && cost.month.startsWith(monthStr)) {
          actualCost += Number(cost.amount || 0)
        }
      })
      
      allocations?.forEach(allocation => {
        if (allocation && allocation.month && allocation.month.startsWith(monthStr) && allocation.salary_cost) {
          actualCost += Number(allocation.salary_cost || 0)
        }
      })
      
      lastActualRevenue = actualRevenue
      lastActualCost = actualCost
    } else {
      // For future months, project based on the last actual values
      if (index === currentMonthIndex + 1) {
        // First projection month uses the last actual values
        projectedRevenue = lastActualRevenue * (1 + revenueGrowthRate)
        projectedCost = lastActualCost * (1 + costGrowthRate)
      } else if (index > 0) {
        // Subsequent months compound from previous projections
        const previousMonth = forecastData[index - 1]
        
        if (previousMonth) {
          // Safely determine previous values with fallbacks to ensure we always have a number
          const prevRevenue = previousMonth.projectedRevenue !== null ? 
                             previousMonth.projectedRevenue : 
                             (previousMonth.actualRevenue !== null ? previousMonth.actualRevenue : 0)
                             
          const prevCost = previousMonth.projectedCost !== null ?
                          previousMonth.projectedCost :
                          (previousMonth.actualCost !== null ? previousMonth.actualCost : 0)
          
          projectedRevenue = prevRevenue * (1 + revenueGrowthRate)
          projectedCost = prevCost * (1 + costGrowthRate)
        } else {
          // Fallback if previous month data is missing
          projectedRevenue = lastActualRevenue * (1 + revenueGrowthRate * index)
          projectedCost = lastActualCost * (1 + costGrowthRate * index)
        }
      }
    }
    
    forecastData.push({
      month: name,
      actualRevenue: isPastMonth ? actualRevenue : null,
      actualCost: isPastMonth ? actualCost : null,
      projectedRevenue: isPastMonth ? null : projectedRevenue,
      projectedCost: isPastMonth ? null : projectedCost,
    })
  })

  return forecastData
}

// Helper to calculate monthly growth rate
function calculateGrowthRate(financialData: any[] = [], selectedYear: number) {
  // Group by month
  const monthlyTotals = new Map()
  
  financialData?.forEach(item => {
    if (!item || !item.month) return
    
    try {
      const itemDate = new Date(item.month)
      const itemYear = itemDate.getFullYear()
      
      if (itemYear === selectedYear) {
        const monthKey = format(itemDate, 'yyyy-MM')
        const currentTotal = monthlyTotals.get(monthKey) || 0
        monthlyTotals.set(monthKey, currentTotal + Number(item.amount || 0))
      }
    } catch (error) {
      console.error("Error processing item for growth rate:", error)
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
