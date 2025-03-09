
import { getYear, isWithinInterval, startOfYear, endOfYear } from "date-fns"

// Helper for calculating project profitability
export function calculateProjectProfitability(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  selectedYear: number
) {
  const projectProfitabilityMap = new Map()
    
  // Initialize with all projects
  projects?.forEach(project => {
    projectProfitabilityMap.set(project.id, {
      revenue: 0,
      variableCosts: 0,
      overheadCosts: 0
    })
  })
  
  // Add revenues
  projectRevenues?.forEach(rev => {
    const revYear = getYear(new Date(rev.month))
    if (revYear === selectedYear && projectProfitabilityMap.has(rev.project_id)) {
      const project = projectProfitabilityMap.get(rev.project_id)
      project.revenue += Number(rev.amount)
      projectProfitabilityMap.set(rev.project_id, project)
    }
  })
  
  // Add variable costs
  variableCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear && projectProfitabilityMap.has(cost.project_id)) {
      const project = projectProfitabilityMap.get(cost.project_id)
      project.variableCosts += Number(cost.amount)
      projectProfitabilityMap.set(cost.project_id, project)
    }
  })
  
  // Add overhead costs
  overheadCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear && projectProfitabilityMap.has(cost.project_id)) {
      const project = projectProfitabilityMap.get(cost.project_id)
      project.overheadCosts += Number(cost.amount)
      projectProfitabilityMap.set(cost.project_id, project)
    }
  })
  
  // Calculate average profitability
  let totalProfitability = 0
  let projectsWithFinancials = 0
  
  projectProfitabilityMap.forEach((data) => {
    const totalCost = data.variableCosts + data.overheadCosts
    // Only count if there's any financial data
    if (data.revenue > 0 || totalCost > 0) {
      // Avoid division by zero
      if (totalCost === 0) {
        totalProfitability += 100 // 100% profit if no costs
      } else {
        const profit = data.revenue - totalCost
        const profitabilityPercent = (profit / totalCost) * 100
        totalProfitability += profitabilityPercent
      }
      projectsWithFinancials++
    }
  })
  
  const avgProjectProfitability = projectsWithFinancials > 0 
    ? Math.round(totalProfitability / projectsWithFinancials) 
    : 0

  return avgProjectProfitability
}

// Helper for calculating resource utilization
export function calculateResourceUtilization(
  allocations: any[],
  yearStart: Date,
  yearEnd: Date
) {
  // Group allocations by month and team member
  const monthlyUtilization = new Map()
  
  allocations?.forEach(allocation => {
    const allocDate = new Date(allocation.month)
    if (isWithinInterval(allocDate, { start: yearStart, end: yearEnd })) {
      const monthKey = allocation.month.substr(0, 7) // YYYY-MM format
      const teamMemberId = allocation.project_assignments.team_member_id
      
      if (!monthlyUtilization.has(monthKey)) {
        monthlyUtilization.set(monthKey, new Map())
      }
      
      const memberMap = monthlyUtilization.get(monthKey)
      const currentAllocation = memberMap.get(teamMemberId) || 0
      memberMap.set(teamMemberId, currentAllocation + allocation.allocation_percentage)
    }
  })
  
  let totalUtilization = 0
  let utilizationDataPoints = 0
  
  monthlyUtilization.forEach(memberMap => {
    memberMap.forEach(allocation => {
      // Cap at 100% per person per month
      totalUtilization += Math.min(allocation, 100)
      utilizationDataPoints++
    })
  })
  
  const resourceUtilization = utilizationDataPoints > 0 
    ? Math.round(totalUtilization / utilizationDataPoints) 
    : 0

  return resourceUtilization
}

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
