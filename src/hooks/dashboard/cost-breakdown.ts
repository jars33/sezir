
import { getYear } from "date-fns"

// Calculate cost breakdown by category
export function calculateCostBreakdown(
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number
) {
  // Calculate total costs by category
  let totalVariableCosts = 0
  let totalExplicitOverheadCosts = 0 // These are overhead costs directly entered in the system
  let totalSalaryCosts = 0
  
  // Sum variable costs
  variableCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear) {
      totalVariableCosts += Number(cost.amount)
    }
  })
  
  // Sum explicit overhead costs - these are directly entered overhead costs
  overheadCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear) {
      totalExplicitOverheadCosts += Number(cost.amount)
    }
  })
  
  // Sum salary costs from allocations
  allocations?.forEach(allocation => {
    const allocationYear = getYear(new Date(allocation.month))
    if (allocationYear === selectedYear) {
      if (allocation.salary_cost !== undefined && allocation.salary_cost !== null) {
        totalSalaryCosts += Number(allocation.salary_cost)
      }
    }
  })
  
  // Calculate total
  const totalCosts = totalVariableCosts + totalExplicitOverheadCosts + totalSalaryCosts
  
  // Create breakdown items with percentages
  const costBreakdown = [
    {
      category: "Salaries",
      value: totalSalaryCosts,
      percentage: totalCosts > 0 ? (totalSalaryCosts / totalCosts) * 100 : 0
    },
    {
      category: "Variable Costs",
      value: totalVariableCosts,
      percentage: totalCosts > 0 ? (totalVariableCosts / totalCosts) * 100 : 0
    },
    {
      category: "Overhead",
      value: totalExplicitOverheadCosts,
      percentage: totalCosts > 0 ? (totalExplicitOverheadCosts / totalCosts) * 100 : 0
    }
  ]
  
  return costBreakdown
}
