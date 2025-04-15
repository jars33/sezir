
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";
import { useRef, useEffect } from "react";

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
  const { registerContainer, scrollLeft } = useSynchronizedScroll();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    registerContainer(tableContainerRef.current);
  }, [registerContainer]);
  
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);
  
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  };
  
  const formatPercentage = (percentage: number) => {
    return `${showDecimals ? percentage.toFixed(1) : Math.round(percentage)}%`;
  };
  
  const getValueColorClass = (value: number, isPositive: boolean) => {
    if (value === 0) {
      return "text-gray-400 dark:text-gray-500";
    }
    if (isPositive) {
      return value >= 0 
        ? "text-emerald-600 dark:text-emerald-400" 
        : "text-red-600 dark:text-red-400";
    } else {
      return "text-red-700 dark:text-red-400";
    }
  };
  
  const monthlyData = months.map(month => {
    const monthStr = format(month, "yyyy-MM");
    
    const monthRevenues = revenues
      .filter(r => r.month.startsWith(monthStr))
      .reduce((sum, r) => sum + Number(r.amount), 0);
      
    const monthVariableCosts = variableCosts
      .filter(c => c.month.startsWith(monthStr))
      .reduce((sum, c) => sum + Number(c.amount), 0);
    
    const monthAllocations = allocations
      .filter(a => a.month.startsWith(monthStr))
      .reduce((sum, a) => sum + Number(a.salary_cost), 0);
    
    const totalCosts = monthVariableCosts + monthAllocations;
    
    const monthlyProfit = monthRevenues - totalCosts;
    
    const monthlyRentabilityPercentage = totalCosts > 0 ? (monthlyProfit / totalCosts) * 100 : 0;
    
    const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
    
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
    <div className="overflow-x-auto border rounded-lg" ref={tableContainerRef}>
      <div style={{ minWidth: "2400px" }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="sticky left-0 z-10 bg-muted/50 w-[180px] font-medium">{t('costs.metric')}</TableHead>
              {months.map((month) => (
                <TableHead key={month.getTime()} className="text-right font-medium">
                  {t(`common.months.${month.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-red-50 dark:bg-red-950/20">
              <TableCell className="sticky left-0 z-10 bg-red-50 dark:bg-red-950/20 font-medium">
                <div className="flex items-center">
                  <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                  {t('costs.monthlyCosts')}
                </div>
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right", 
                    getValueColorClass(data.monthlyCosts, false)
                  )}
                >
                  {formatCurrency(data.monthlyCosts)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow className="bg-red-50/50 dark:bg-red-950/10">
              <TableCell className="sticky left-0 z-10 bg-red-50/50 dark:bg-red-950/10 font-medium">
                {t('costs.accumulatedCosts')}
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right",
                    getValueColorClass(data.accumulatedCosts, false)
                  )}
                >
                  {formatCurrency(data.accumulatedCosts)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow className="bg-green-50 dark:bg-green-950/20">
              <TableCell className="sticky left-0 z-10 bg-green-50 dark:bg-green-950/20 font-medium">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  {t('costs.monthlyRevenues')}
                </div>
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index}
                  className={cn(
                    "text-right",
                    getValueColorClass(data.monthlyRevenues, true)
                  )}
                >
                  {formatCurrency(data.monthlyRevenues)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow className="bg-green-50/50 dark:bg-green-950/10">
              <TableCell className="sticky left-0 z-10 bg-green-50/50 dark:bg-green-950/10 font-medium">
                {t('costs.accumulatedRevenues')}
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right",
                    getValueColorClass(data.accumulatedRevenues, true)
                  )}
                >
                  {formatCurrency(data.accumulatedRevenues)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-white dark:bg-gray-900 font-medium">
                {t('costs.monthlyProfit')}
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right font-medium",
                    getValueColorClass(data.monthlyProfit, true)
                  )}
                >
                  {formatCurrency(data.monthlyProfit)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-white dark:bg-gray-900 font-medium">
                {t('costs.monthlyProfitPercentage')}
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right font-medium",
                    getValueColorClass(data.monthlyRentabilityPercentage, true)
                  )}
                >
                  {formatPercentage(data.monthlyRentabilityPercentage)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow className="bg-slate-50 dark:bg-slate-900/30">
              <TableCell className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900/30 font-medium">
                {t('costs.accumulatedProfit')}
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right font-medium",
                    getValueColorClass(data.accumulatedProfit, true)
                  )}
                >
                  {formatCurrency(data.accumulatedProfit)}
                </TableCell>
              ))}
            </TableRow>
            
            <TableRow className="bg-slate-50 dark:bg-slate-900/30">
              <TableCell className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900/30 font-medium">
                {t('costs.accumulatedProfitPercentage')}
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right font-medium",
                    getValueColorClass(data.accumulatedRentabilityPercentage, true)
                  )}
                >
                  {formatPercentage(data.accumulatedRentabilityPercentage)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
