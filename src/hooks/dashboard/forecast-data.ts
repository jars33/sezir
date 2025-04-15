
import { format } from "date-fns"
import i18next from "i18next"

export function generateForecastData(
  selectedYear: number,
  projectRevenues: any[] = [],
  projectVariableCosts: any[] = [], // Renamed parameter to avoid name clash
  overheadCosts: any[] = [],
  allocations: any[] = [],
  overheadPercentage: number = 15 // Add overhead percentage parameter with default
) {
  // Initialize with empty arrays if inputs are undefined
  projectRevenues = projectRevenues || []
  projectVariableCosts = projectVariableCosts || [] // Use renamed parameter
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
    let monthlySalaryCosts = 0
    let monthlyVariableCosts = 0
    
    // Calculate actuals for the month
    projectRevenues?.forEach(rev => {
      if (rev && rev.month && rev.month.startsWith(monthStr)) {
        actualRevenue += Number(rev.amount || 0)
      }
    })
    
    // Use the renamed parameter projectVariableCosts (which is always an array)
    projectVariableCosts.forEach(cost => {
      if (cost && cost.month && cost.month.startsWith(monthStr)) {
        monthlyVariableCosts += Number(cost.amount || 0)
      }
    })
    
    // Allocations for salary costs
    allocations.forEach(allocation => {
      if (allocation && allocation.month && allocation.month.startsWith(monthStr) && allocation.salary_cost) {
        monthlySalaryCosts += Number(allocation.salary_cost || 0)
      }
    })
    
    // Calculate base costs (variable + salary costs)
    const baseCosts = monthlyVariableCosts + monthlySalaryCosts
    
    // Calculate overhead costs based on the overhead percentage
    const calculatedOverheadCosts = (baseCosts * overheadPercentage) / 100
    
    // Total costs = base costs + calculated overhead
    const totalCosts = baseCosts + calculatedOverheadCosts
    
    forecastData.push({
      month: monthName,
      actualRevenue: actualRevenue,
      actualCost: totalCosts
    })
  }

  return forecastData
}
