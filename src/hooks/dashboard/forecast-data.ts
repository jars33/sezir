
import { format } from "date-fns"
import i18next from "i18next"

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
  
  // Include all 12 months of the selected year
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1)
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()]
    const monthName = i18next.t(`common.months.${monthKey}`)
    const monthStr = month.toISOString().substr(0, 7) // YYYY-MM
    
    let actualRevenue = 0
    let actualCost = 0
    
    // Calculate actuals for the month
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
    
    forecastData.push({
      month: monthName,
      actualRevenue: actualRevenue,
      actualCost: actualCost
    })
  }

  return forecastData
}
