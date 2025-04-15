
import { calculateProjectFinancials } from "@/utils/financial-calculations"

// Calculate project margins for all projects
export function calculateProjectMargins(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number,
  overheadPercentage: number = 15 
) {
  // Use the centralized calculation function to get project financials
  const projectFinancials = calculateProjectFinancials(
    projects,
    projectRevenues,
    variableCosts,
    allocations,
    selectedYear,
    overheadPercentage
  );
  
  // Sort by margin in descending order
  return projectFinancials.sort((a, b) => b.margin - a.margin);
}
