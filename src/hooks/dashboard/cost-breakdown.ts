
import { getYear } from "date-fns"
import { calculateFinancialSummary, calculateFinancialSummaryWithFullSalaries } from "@/utils/financial-calculations"
import { TeamMemberSalary } from "./types"

// Calculate cost breakdown by category
export function calculateCostBreakdown(
  variableCosts: any[],
  overheadCosts: any[],
  allocationsOrSalaries: any[],
  selectedYear: number,
  overheadPercentage: number = 15,
  useFullSalaries: boolean = false
) {
  // Use the appropriate centralized calculation function
  const {
    totalVariableCosts,
    totalSalaryCosts,
    totalOverheadCosts,
    totalCosts
  } = useFullSalaries 
    ? calculateFinancialSummaryWithFullSalaries(
        [], // No revenues needed for cost breakdown
        variableCosts,
        allocationsOrSalaries as TeamMemberSalary[],
        selectedYear,
        overheadPercentage
      )
    : calculateFinancialSummary(
        [], // No revenues needed for cost breakdown
        variableCosts,
        allocationsOrSalaries,
        selectedYear,
        overheadPercentage
      )
  
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
