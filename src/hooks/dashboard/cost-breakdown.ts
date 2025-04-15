
import { getYear } from "date-fns"
import { calculateFinancialSummary } from "@/utils/financial-calculations"

// Calculate cost breakdown by category
export function calculateCostBreakdown(
  variableCosts: any[],
  overheadCosts: any[],
  allocations: any[],
  selectedYear: number,
  overheadPercentage: number = 15
) {
  // Use the centralized calculation function
  const {
    totalVariableCosts,
    totalSalaryCosts,
    totalOverheadCosts,
    totalCosts
  } = calculateFinancialSummary(
    [], // No revenues needed for cost breakdown
    variableCosts,
    allocations,
    selectedYear,
    overheadPercentage
  );
  
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
      value: totalOverheadCosts,
      percentage: totalCosts > 0 ? (totalOverheadCosts / totalCosts) * 100 : 0
    }
  ];
  
  return costBreakdown;
}
