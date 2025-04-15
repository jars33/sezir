
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp, DollarSign, Percent, BarChart3, ArrowDownCircle, ArrowUpCircle, PieChart } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useSynchronizedScroll } from "@/hooks/use-synchronized-scroll";
import { useRef, useEffect, useMemo } from "react";
import { useProjectSettings } from "@/hooks/use-project-settings";

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
  const { registerContainer, scrollLeft, setScrollLeft } = useSynchronizedScroll();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { getOverheadPercentage } = useProjectSettings();
  
  useEffect(() => {
    registerContainer(tableContainerRef.current);
  }, [registerContainer]);
  
  useEffect(() => {
    if (tableContainerRef.current && tableContainerRef.current.scrollLeft !== scrollLeft) {
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
  
  const handleScroll = () => {
    if (tableContainerRef.current) {
      setScrollLeft(tableContainerRef.current.scrollLeft);
    }
  };
  
  const monthlyData = useMemo(() => months.map(month => {
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
    
    const overheadPercentage = getOverheadPercentage(year);
    const monthOverheadCosts = ((monthVariableCosts + monthAllocations) * overheadPercentage) / 100;
    
    const totalCosts = monthVariableCosts + monthAllocations + monthOverheadCosts;
    
    const monthlyProfit = monthRevenues - totalCosts;
    
    const monthlyProfitPercentage = monthRevenues > 0 ? (monthlyProfit / monthRevenues) * 100 : 0;
    
    const accumulatedProfit = calculateAccumulatedProfitUpToMonth(month);
    
    const accumulatedVariableCosts = months
      .filter(m => m <= month)
      .flatMap(m => {
        const mStr = format(m, "yyyy-MM");
        return variableCosts
          .filter(c => c.month.startsWith(mStr));
      })
      .reduce((s, c) => s + Number(c.amount), 0);
      
    const accumulatedAllocCosts = months
      .filter(m => m <= month)
      .flatMap(m => {
        const mStr = format(m, "yyyy-MM");
        return allocations
          .filter(a => a.month.startsWith(mStr));
      })
      .reduce((s, a) => s + Number(a.salary_cost), 0);
      
    const accumulatedOverheadCosts = ((accumulatedVariableCosts + accumulatedAllocCosts) * overheadPercentage) / 100;
      
    const accumulatedTotalCosts = accumulatedVariableCosts + accumulatedAllocCosts + accumulatedOverheadCosts;
    
    const accumulatedRevenues = months
      .filter(m => m <= month)
      .flatMap(m => {
        const mStr = format(m, "yyyy-MM");
        return revenues
          .filter(r => r.month.startsWith(mStr));
      })
      .reduce((s, r) => s + Number(r.amount), 0);
    
    const accumulatedProfitPercentage = accumulatedRevenues > 0 ? (accumulatedProfit / accumulatedRevenues) * 100 : 0;
    
    return {
      month,
      monthlyCosts: totalCosts,
      monthlyRevenues: monthRevenues,
      monthlyProfit,
      monthlyProfitPercentage,
      accumulatedCosts: accumulatedTotalCosts,
      accumulatedRevenues,
      accumulatedProfit,
      accumulatedProfitPercentage
    };
  }), [months, revenues, variableCosts, allocations, getOverheadPercentage, year, calculateAccumulatedProfitUpToMonth]);
  
  return (
    <div 
      className="overflow-x-auto border rounded-lg" 
      ref={tableContainerRef}
      onScroll={handleScroll}
    >
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
            {/* Monthly Costs - Red */}
            <TableRow className="bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/40">
              <TableCell className="sticky left-0 z-10 bg-red-50/80 dark:bg-red-950/30 font-medium">
                <div className="flex items-center">
                  <ArrowDownCircle className="mr-2 h-4 w-4 text-red-500" />
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
            
            {/* Accumulated Costs - Light Red */}
            <TableRow className="bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/30">
              <TableCell className="sticky left-0 z-10 bg-red-50/50 dark:bg-red-950/20 font-medium">
                <div className="flex items-center">
                  <TrendingDown className="mr-2 h-4 w-4 text-red-500/80" />
                  {t('costs.accumulatedCosts')}
                </div>
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
            
            {/* Monthly Revenues - Green */}
            <TableRow className="bg-green-50/80 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/40">
              <TableCell className="sticky left-0 z-10 bg-green-50/80 dark:bg-green-950/30 font-medium">
                <div className="flex items-center">
                  <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" />
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
            
            {/* Accumulated Revenues - Light Green */}
            <TableRow className="bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/50 dark:hover:bg-green-950/30">
              <TableCell className="sticky left-0 z-10 bg-green-50/50 dark:bg-green-950/20 font-medium">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500/80" />
                  {t('costs.accumulatedRevenues')}
                </div>
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
            
            {/* Monthly Profit - Blue */}
            <TableRow className="bg-blue-50/70 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30">
              <TableCell className="sticky left-0 z-10 bg-blue-50/70 dark:bg-blue-950/20 font-medium">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
                  {t('costs.monthlyProfit')}
                </div>
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
            
            {/* Monthly Profit % - Light Blue */}
            <TableRow className="bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-100/40 dark:hover:bg-blue-950/20">
              <TableCell className="sticky left-0 z-10 bg-blue-50/40 dark:bg-blue-950/10 font-medium">
                <div className="flex items-center">
                  <Percent className="mr-2 h-4 w-4 text-blue-500/80" />
                  {t('costs.monthlyProfitPercentage')}
                </div>
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right font-medium",
                    getValueColorClass(data.monthlyProfitPercentage, true)
                  )}
                >
                  {formatPercentage(data.monthlyProfitPercentage)}
                </TableCell>
              ))}
            </TableRow>
            
            {/* Accumulated Profit - Purple */}
            <TableRow className="bg-purple-50/70 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30">
              <TableCell className="sticky left-0 z-10 bg-purple-50/70 dark:bg-purple-950/20 font-medium">
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                  {t('costs.accumulatedProfit')}
                </div>
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
            
            {/* Accumulated Profit % - Light Purple */}
            <TableRow className="bg-purple-50/40 dark:bg-purple-950/10 hover:bg-purple-100/40 dark:hover:bg-purple-950/20">
              <TableCell className="sticky left-0 z-10 bg-purple-50/40 dark:bg-purple-950/10 font-medium">
                <div className="flex items-center">
                  <PieChart className="mr-2 h-4 w-4 text-purple-500/80" />
                  {t('costs.accumulatedProfitPercentage')}
                </div>
              </TableCell>
              {monthlyData.map((data, index) => (
                <TableCell 
                  key={index} 
                  className={cn(
                    "text-right font-medium",
                    getValueColorClass(data.accumulatedProfitPercentage, true)
                  )}
                >
                  {formatPercentage(data.accumulatedProfitPercentage)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
