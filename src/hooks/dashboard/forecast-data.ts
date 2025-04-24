
import { format } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData, generateMonthlyFinancialDataWithFullSalaries } from "@/utils/financial-calculations"
import { TeamMemberSalary } from "./types"

export function generateForecastData(
  selectedYear: number,
  projectRevenues: any[] = [],
  projectVariableCosts: any[] = [],
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
        projectVariableCosts, 
        allocationsOrSalaries as TeamMemberSalary[],
        overheadPercentage
      )
    : generateMonthlyFinancialData(
        selectedYear, 
        projectRevenues, 
        projectVariableCosts, 
        allocationsOrSalaries,
        overheadPercentage
      )

  const forecastData = [];
  
  // Include all 12 months of the selected year
  for (let i = 0; i < 12; i++) {
    const month = new Date(selectedYear, i, 1);
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][month.getMonth()];
    const monthName = i18next.t(`common.months.${monthKey}`);
    
    forecastData.push({
      month: monthName,
      actualRevenue: monthlyData[i].revenue,
      actualCost: monthlyData[i].totalCost
    });
  }

  return forecastData;
}
