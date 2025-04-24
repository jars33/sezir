
import { format } from "date-fns"
import i18next from "i18next"
import { generateMonthlyFinancialData, generateMonthlyFinancialDataWithFullSalaries } from "@/utils/financial-calculations"
import { TeamMemberSalary } from "./types"

// Generate year comparison data for the dashboard
export function generateYearComparisonData(
  selectedYear: number,
  projectRevenues: any[] = [],
  variableCosts: any[] = [],
  overheadCosts: any[] = [],
  allocationsOrSalaries: any[] = [],
  overheadPercentage: number = 15,
  useFullSalaries: boolean = false
) {
  // Get data for current year
  const currentYearData = useFullSalaries
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
  
  // Get data for previous year
  const previousYearData = useFullSalaries
    ? generateMonthlyFinancialDataWithFullSalaries(
        selectedYear - 1,
        projectRevenues.filter(r => {
          const year = new Date(r.month).getFullYear();
          return year === selectedYear - 1;
        }),
        variableCosts.filter(c => {
          const year = new Date(c.month).getFullYear();
          return year === selectedYear - 1;
        }),
        allocationsOrSalaries.filter(s => {
          const year = new Date(s.month).getFullYear();
          return year === selectedYear - 1;
        }) as TeamMemberSalary[],
        overheadPercentage
      )
    : generateMonthlyFinancialData(
        selectedYear - 1,
        projectRevenues.filter(r => {
          const year = new Date(r.month).getFullYear();
          return year === selectedYear - 1;
        }),
        variableCosts.filter(c => {
          const year = new Date(c.month).getFullYear();
          return year === selectedYear - 1;
        }),
        allocationsOrSalaries.filter(a => {
          const year = new Date(a.month).getFullYear();
          return year === selectedYear - 1;
        }),
        overheadPercentage
      )
  
  const yearComparisonData = [];
  
  // Format data for year comparison chart
  for (let i = 0; i < 12; i++) {
    const currentMonthData = currentYearData.monthlyData[i];
    const previousMonthData = previousYearData.monthlyData[i];
    
    const monthKey = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][i];
    const monthName = i18next.t(`common.months.${monthKey}`);
    
    yearComparisonData.push({
      month: monthName,
      currentYearRevenue: currentMonthData.revenue,
      previousYearRevenue: previousMonthData.revenue,
      currentYearProfit: currentMonthData.profit,
      previousYearProfit: previousMonthData.profit
    });
  }
  
  return yearComparisonData;
}
