
import { getYear } from "date-fns"
import i18next from "i18next"

// Generate cash flow data
export function generateCashFlowData(
  selectedYear: number,
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[]
) {
  const cashFlowData = []
  
  // For the selected year, include all months
  const months = []
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1)
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()]
    const monthName = i18next.t(`common.months.${monthKey}`)
    months.push({ date: month, name: monthName })
  }
  
  // For each month, calculate the cash flow components
  months.forEach(({ date, name }) => {
    const monthStr = date.toISOString().substr(0, 7) // YYYY-MM
    
    let monthlyRevenue = 0
    projectRevenues?.forEach(rev => {
      if (rev.month.startsWith(monthStr)) {
        monthlyRevenue += Number(rev.amount)
      }
    })
    
    let monthlyVariableCosts = 0
    variableCosts?.forEach(cost => {
      if (cost.month.startsWith(monthStr)) {
        monthlyVariableCosts += Number(cost.amount)
      }
    })
    
    let monthlyOverheadCosts = 0
    overheadCosts?.forEach(cost => {
      if (cost.month.startsWith(monthStr)) {
        monthlyOverheadCosts += Number(cost.amount)
      }
    })
    
    let monthlySalaryCosts = 0
    allocations?.forEach(allocation => {
      if (allocation.month.startsWith(monthStr) && allocation.salary_cost !== undefined && allocation.salary_cost !== null) {
        monthlySalaryCosts += Number(allocation.salary_cost)
      }
    })
    
    // Calculate net cash flow
    const netCashFlow = monthlyRevenue - monthlyVariableCosts - monthlyOverheadCosts - monthlySalaryCosts
    
    cashFlowData.push({
      month: name,
      revenue: monthlyRevenue,
      variableCosts: monthlyVariableCosts,
      overheadCosts: monthlyOverheadCosts,
      salaryCosts: monthlySalaryCosts,
      netCashFlow: netCashFlow
    })
  })

  return cashFlowData
}
