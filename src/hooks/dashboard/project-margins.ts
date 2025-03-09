
import { getYear } from "date-fns"

// Calculate project margins for all projects
export function calculateProjectMargins(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
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
  
  // Calculate margins and filter out projects with no financial data
  const projectMargins = []
  
  projectFinancialsMap.forEach((data) => {
    // Only include if there's any financial data
    if (data.revenue > 0 || data.cost > 0) {
      // Calculate margin as (revenue - cost) / revenue * 100
      if (data.revenue > 0) {
        data.margin = ((data.revenue - data.cost) / data.revenue) * 100
      } else {
        data.margin = -100 // -100% margin if no revenue but has costs
      }
      projectMargins.push(data)
    }
  })
  
  // Sort by margin in descending order
  return projectMargins.sort((a, b) => b.margin - a.margin)
}
