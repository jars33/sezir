
import { getYear } from "date-fns"
import { calculateProjectFinancials } from "@/utils/financial-calculations"

// Helper for calculating project profitability
export function calculateProjectProfitability(
  projects: any[],
  projectRevenues: any[],
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number,
  overheadPercentage: number = 15
) {
  // Use the centralized calculation function
  const projectFinancials = calculateProjectFinancials(
    projects,
    projectRevenues,
    variableCosts,
    allocations,
    selectedYear,
    overheadPercentage
  );
  
  // Calculate average profitability
  let totalProfitability = 0;
  let projectsWithFinancials = 0;
  
  projectFinancials.forEach(data => {
    // Only count if there's any financial data
    if (data.revenue > 0 || data.totalCost > 0) {
      // Add margin to total
      totalProfitability += data.margin;
      projectsWithFinancials++;
    }
  });
  
  const avgProjectProfitability = projectsWithFinancials > 0 
    ? Math.round(totalProfitability / projectsWithFinancials) 
    : 0;

  return avgProjectProfitability;
}
