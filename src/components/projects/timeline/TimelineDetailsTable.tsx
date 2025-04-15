
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

interface TimelineDetailsTableProps {
  startDate: Date;
  revenues: any[];
  variableCosts: any[];
  allocations: any[];
  calculateAccumulatedProfitUpToMonth: (targetMonth: Date) => number;
  year: number;
}

export function TimelineDetailsTable({
  startDate,
  revenues,
  variableCosts,
  allocations,
  calculateAccumulatedProfitUpToMonth,
  year
}: TimelineDetailsTableProps) {
  const { t } = useTranslation();
  const [showDecimals] = useLocalStorage<boolean>("showDecimals", true);
  
  // Generate months array
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));
  
  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  };
  
  // Format percentage function
  const formatPercentage = (percentage: number) => {
    return `${showDecimals ? percentage.toFixed(1) : Math.round(percentage)}%`;
  };
  
  // Calculate monthly costs, revenues, and profits for each month
  const monthlyData = months.map(month => {
    const monthStr = format(month, "yyyy-MM");
    
    // Filter revenues, costs and allocations for the current month
    const monthRevenues = revenues
      .filter(r => r.month.startsWith(monthStr))
      .reduce((sum, r) => sum + Number(r.amount), 0);
      
    const monthVariableCosts = variableCosts
      .filter(c => c.month.startsWith(monthStr))
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    const monthAllocations = allocations
      .filter(a => a.month.startsWith(monthStr))
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    // Calculate total costs (variable + allocations)
    const totalCosts = monthVariableCosts + monthAllocations;
    
    // Calculate monthly profit
    const monthlyProfit = monthRevenues - totalCosts;
    
    // Calculate monthly rentability percentage
    const monthlyRentabilityPercentage = totalCosts > 0 ? (monthlyProfit / totalCosts) * 100 : 0;
    
    // Calculate accumulated values up to this month
    const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
    
    // Calculate accumulated costs and revenues
    const accumulatedCosts = months
      .filter(m => m <= month)
      .reduce((sum, m) => {
        const mStr = format(m, "yyyy-MM");
        const mVarCosts = variableCosts
          .filter(c => c.month.startsWith(mStr))
          .reduce((s, c) => s + Number(c.amount), 0);
        const mAllocCosts = allocations
          .filter(a => a.month.startsWith(mStr))
          .reduce((s, a) => s + Number(a.salary_cost), 0);
        return sum + mVarCosts + mAllocCosts;
      }, 0);
      
    const accumulatedRevenues = months
      .filter(m => m <= month)
      .reduce((sum, m) => {
        const mStr = format(m, "yyyy-MM");
        const mRev = revenues
          .filter(r => r.month.startsWith(mStr))
          .reduce((s, r) => s + Number(r.amount), 0);
        return sum + mRev;
      }, 0);
    
    // Calculate accumulated rentability percentage
    const accumulatedRentabilityPercentage = accumulatedCosts > 0 ? (accumulatedProfit / accumulatedCosts) * 100 : 0;
    
    return {
      month,
      monthlyCosts: totalCosts,
      monthlyRevenues: monthRevenues,
      monthlyProfit,
      monthlyRentabilityPercentage,
      accumulatedCosts,
      accumulatedRevenues,
      accumulatedProfit,
      accumulatedRentabilityPercentage
    };
  });
  
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px] font-medium">{t('costs.metric')}</TableHead>
            {months.map((month) => (
              <TableHead key={month.getTime()} className="text-right font-medium">
                {t(`common.months.${month.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Monthly Costs Row */}
          <TableRow className="bg-red-50 dark:bg-red-950/20">
            <TableCell className="font-medium">
              <div className="flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                {t('costs.monthlyCosts')}
              </div>
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell key={index} className="text-right text-red-700 dark:text-red-400">
                {formatCurrency(data.monthlyCosts)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Accumulated Costs Row */}
          <TableRow className="bg-red-50/50 dark:bg-red-950/10">
            <TableCell className="font-medium">
              {t('costs.accumulatedCosts')}
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell key={index} className="text-right text-red-700 dark:text-red-400">
                {formatCurrency(data.accumulatedCosts)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Monthly Revenues Row */}
          <TableRow className="bg-green-50 dark:bg-green-950/20">
            <TableCell className="font-medium">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                {t('costs.monthlyRevenues')}
              </div>
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell key={index} className="text-right text-green-700 dark:text-green-400">
                {formatCurrency(data.monthlyRevenues)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Accumulated Revenues Row */}
          <TableRow className="bg-green-50/50 dark:bg-green-950/10">
            <TableCell className="font-medium">
              {t('costs.accumulatedRevenues')}
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell key={index} className="text-right text-green-700 dark:text-green-400">
                {formatCurrency(data.accumulatedRevenues)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Monthly Profit Row */}
          <TableRow>
            <TableCell className="font-medium">
              {t('costs.monthlyProfit')}
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell 
                key={index} 
                className={cn(
                  "text-right font-medium",
                  data.monthlyProfit >= 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatCurrency(data.monthlyProfit)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Monthly Profit Percentage Row */}
          <TableRow>
            <TableCell className="font-medium">
              {t('costs.monthlyProfitPercentage')}
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell 
                key={index} 
                className={cn(
                  "text-right font-medium",
                  data.monthlyRentabilityPercentage >= 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatPercentage(data.monthlyRentabilityPercentage)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Accumulated Profit Row */}
          <TableRow className="bg-slate-50 dark:bg-slate-900/30">
            <TableCell className="font-medium">
              {t('costs.accumulatedProfit')}
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell 
                key={index} 
                className={cn(
                  "text-right font-medium",
                  data.accumulatedProfit >= 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatCurrency(data.accumulatedProfit)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Accumulated Profit Percentage Row */}
          <TableRow className="bg-slate-50 dark:bg-slate-900/30">
            <TableCell className="font-medium">
              {t('costs.accumulatedProfitPercentage')}
            </TableCell>
            {monthlyData.map((data, index) => (
              <TableCell 
                key={index} 
                className={cn(
                  "text-right font-medium",
                  data.accumulatedRentabilityPercentage >= 0 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatPercentage(data.accumulatedRentabilityPercentage)}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
