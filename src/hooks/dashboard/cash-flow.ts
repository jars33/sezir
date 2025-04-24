
import { format } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData, generateMonthlyFinancialDataWithFullSalaries } from "@/utils/financial-calculations"
import { TeamMemberSalary } from "./types"

// Generate cash flow data for the dashboard
export function generateCashFlowData(
  selectedYear: number,
  projectRevenues: any[] = [],
  variableCosts: any[] = [],
  overheadCosts: any[] = [],
  allocationsOrSalaries: any[] = [],
  overheadPercentage: number = 15,
  useFullSalaries: boolean = false
) {
  // Use appropriate function based on data type
  const { monthlyData } = useFullSalaries
    ? generateMonthlyFinancialDataWithFullSalaries(
        selectedYear, 
        projectRevenues, 
        variableCosts, 
        allocationsOrSalaries as TeamMemberSalary[],
        overheadPercentage
      )
    : generateMonthlyFinancialData(
        selectedYear, 
        projectRevenues, 
        variableCosts, 
        allocationsOrSalaries,
        overheadPercentage
      )
  
  const cashFlowData = [];
  
  // Format data for cash flow chart
  for (let i = 0; i < 12; i++) {
    const monthData = monthlyData[i];
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][i];
    const monthName = i18next.t(`common.months.${monthKey}`);
    
    cashFlowData.push({
      month: monthName,
      revenue: monthData.revenue,
      variableCosts: monthData.variableCost,
      salaryCosts: monthData.salaryCost,
      overheadCosts: monthData.overheadCost,
      netCashFlow: monthData.profit
    });
  }
  
  return cashFlowData;
}
