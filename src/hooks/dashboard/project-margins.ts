
import { getYear } from "date-fns"

// Calculate project margins for all projects
export function calculateProjectMargins(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number
) {
  const projectFinancialsMap = new Map()
    
  // Initialize with all projects
  projects?.forEach(project => {
    projectFinancialsMap.set(project.id, {
      projectId: project.id,
      projectName: project.name || project.number,
      revenue: 0,
      cost: 0,
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
      project.cost += Number(cost.amount)
      projectFinancialsMap.set(cost.project_id, project)
    }
  })
  
  // Add overhead costs
  overheadCosts?.forEach(cost => {
    const costYear = getYear(new Date(cost.month))
    if (costYear === selectedYear && projectFinancialsMap.has(cost.project_id)) {
      const project = projectFinancialsMap.get(cost.project_id)
      project.cost += Number(cost.amount)
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
        project.cost += Number(allocation.salary_cost)
        projectFinancialsMap.set(projectId, project)
      }
    }
  })
  
  // Calculate margins and include all projects with financial data
  const projectMargins = []
  
  projectFinancialsMap.forEach((data) => {
    // Calculate margin for ALL projects, including those with zero values
    // Just ensure we don't divide by zero
    if (data.revenue > 0) {
      data.margin = ((data.revenue - data.cost) / data.revenue) * 100
    } else if (data.cost > 0) {
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
