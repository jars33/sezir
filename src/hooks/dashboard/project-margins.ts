
import { getYear } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"

// Calculate project margins for all projects
export function calculateProjectMargins(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number,
  overheadPercentage: number = 15 // Default to 15% if not provided
) {
  const projectFinancialsMap = new Map()
    
  // Initialize with all projects
  projects?.forEach(project => {
    projectFinancialsMap.set(project.id, {
      projectId: project.id,
      projectName: project.name || project.number,
      revenue: 0,
      variableCost: 0,
      salaryCost: 0,
      explicitOverheadCost: 0,
      totalCost: 0,
      margin: 0
    })
  })
  
  // Add revenues
  projectRevenues?.forEach(rev => {
    const revYear = getYear(new Date(rev.month))
    if (revYear === selectedYear && projectFinancialsMap.has(rev.project_id)) {
      const project = projectFinancialsMap.get(rev.project_id)
      project.revenue += Number(rev.amount)
      projectFinancialsMap.set(rev.project_id, project)
    }
  })
  
  // Add variable costs
  variableCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear && projectFinancialsMap.has(cost.project_id)) {
      const project = projectFinancialsMap.get(cost.project_id)
      project.variableCost += Number(cost.amount)
      projectFinancialsMap.set(cost.project_id, project)
    }
  })
  
  // Add explicit overhead costs
  overheadCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear && projectFinancialsMap.has(cost.project_id)) {
      const project = projectFinancialsMap.get(cost.project_id)
      project.explicitOverheadCost += Number(cost.amount)
      projectFinancialsMap.set(cost.project_id, project)
    }
  })
  
  // Add salary costs from allocations
  allocations?.forEach(allocation => {
    const allocYear = getYear(new Date(allocation.month))
    if (allocYear === selectedYear && allocation.project_assignments?.project?.id) {
      const projectId = allocation.project_assignments.project.id
      if (projectFinancialsMap.has(projectId) && allocation.salary_cost) {
        const project = projectFinancialsMap.get(projectId)
        project.salaryCost += Number(allocation.salary_cost)
        projectFinancialsMap.set(projectId, project)
      }
    }
  })
  
  // Calculate margins and include all projects with financial data
  const projectMargins = []
  
  projectFinancialsMap.forEach((data) => {
    // Calculate base costs (variable + salary)
    const baseCosts = data.variableCost + data.salaryCost
    
    // Apply overhead percentage: base costs * (overheadPercentage/100)
    const calculatedOverheadCost = (baseCosts * overheadPercentage) / 100
    
    // Total cost includes base costs with overhead percentage applied plus any explicit overhead costs
    data.totalCost = baseCosts + calculatedOverheadCost + data.explicitOverheadCost
    
    // Calculate profit
    const profit = data.revenue - data.totalCost
    
    if (data.revenue > 0) {
      // Calculate margin as (profit / revenue) * 100
      data.margin = (profit / data.revenue) * 100
    } else if (data.totalCost > 0) {
      data.margin = -100 // -100% margin if no revenue but has costs
    } else {
      data.margin = 0 // No financial data
    }
    
    // Include all projects, even those with no financial data
    projectMargins.push(data)
  })
  
  // Sort by margin in descending order
  return projectMargins.sort((a, b) => b.margin - a.margin)
}
