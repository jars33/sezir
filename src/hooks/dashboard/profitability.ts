
import { getYear } from "date-fns"

// Helper for calculating project profitability
export function calculateProjectProfitability(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number
) {
  const projectProfitabilityMap = new Map()
    
  // Initialize with all projects
  projects?.forEach(project => {
    projectProfitabilityMap.set(project.id, {
      revenue: 0,
      variableCosts: 0,
      overheadCosts: 0,
      salaryCosts: 0
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
  
  // Add salary costs from allocations
  allocations?.forEach(allocation => {
    const allocYear = getYear(new Date(allocation.month))
    if (allocYear === selectedYear && allocation.project_assignments?.project?.id) {
      const projectId = allocation.project_assignments.project.id
      if (projectProfitabilityMap.has(projectId) && allocation.salary_cost) {
        const project = projectProfitabilityMap.get(projectId)
        project.salaryCosts += Number(allocation.salary_cost)
        projectProfitabilityMap.set(projectId, project)
      }
    }
  })
  
  // Calculate average profitability
  let totalProfitability = 0
  let projectsWithFinancials = 0
  
  projectProfitabilityMap.forEach((data) => {
    const totalCost = data.variableCosts + data.overheadCosts + data.salaryCosts
    const profit = data.revenue - totalCost
    
    // Only count if there's any financial data
    if (data.revenue > 0 || totalCost > 0) {
      // Calculate profitability as profit / revenue
      if (data.revenue > 0) {
        const profitabilityPercent = (profit / data.revenue) * 100
        totalProfitability += profitabilityPercent
      } else if (totalCost > 0) {
        // If there's no revenue but there are costs, it's -100%
        totalProfitability -= 100
      }
      projectsWithFinancials++
    }
  })
  
  const avgProjectProfitability = projectsWithFinancials > 0 
    ? Math.round(totalProfitability / projectsWithFinancials) 
    : 0

  return avgProjectProfitability
}
