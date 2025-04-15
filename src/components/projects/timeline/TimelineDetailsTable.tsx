
import { useTranslation } from "react-i18next";
import { Table, TableBody } from "@/components/ui/table";
import { TrendingDown, TrendingUp, DollarSign, Percent, BarChart3, ArrowDownCircle, ArrowUpCircle, PieChart } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { SynchronizedTableContainer } from "./table/SynchronizedTableContainer";
import { TimelineTableHeader } from "./table/TableHeader";
import { MetricRow } from "./table/MetricRow";
import { useTimelineTableData } from "./hooks/useTimelineTableData";

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
  
  // Use our custom hook to calculate all the data
  const { months, monthlyData } = useTimelineTableData({
    startDate,
    revenues,
    variableCosts,
    allocations,
    calculateAccumulatedProfitUpToMonth,
    year
  });
  
  return (
    <SynchronizedTableContainer>
      <Table>
        <TimelineTableHeader months={months} />
        <TableBody>
          {/* Monthly Costs - Red */}
          <MetricRow
            label={t('costs.monthlyCosts')}
            icon={ArrowDownCircle}
            iconColor="text-red-500"
            data={monthlyData.map(data => ({ value: data.monthlyCosts }))}
            isPositive={false}
            bgClass="bg-red-50/80 dark:bg-red-950/30"
            hoverClass="hover:bg-red-100 dark:hover:bg-red-950/40"
            showDecimals={showDecimals}
          />
          
          {/* Accumulated Costs - Light Red */}
          <MetricRow
            label={t('costs.accumulatedCosts')}
            icon={TrendingDown}
            iconColor="text-red-500/80"
            data={monthlyData.map(data => ({ value: data.accumulatedCosts }))}
            isPositive={false}
            bgClass="bg-red-50/50 dark:bg-red-950/20"
            hoverClass="hover:bg-red-100/50 dark:hover:bg-red-950/30"
            showDecimals={showDecimals}
          />
          
          {/* Monthly Revenues - Green */}
          <MetricRow
            label={t('costs.monthlyRevenues')}
            icon={ArrowUpCircle}
            iconColor="text-green-500"
            data={monthlyData.map(data => ({ value: data.monthlyRevenues }))}
            isPositive={true}
            bgClass="bg-green-50/80 dark:bg-green-950/30"
            hoverClass="hover:bg-green-100 dark:hover:bg-green-950/40"
            showDecimals={showDecimals}
          />
          
          {/* Accumulated Revenues - Light Green */}
          <MetricRow
            label={t('costs.accumulatedRevenues')}
            icon={TrendingUp}
            iconColor="text-green-500/80"
            data={monthlyData.map(data => ({ value: data.accumulatedRevenues }))}
            isPositive={true}
            bgClass="bg-green-50/50 dark:bg-green-950/20"
            hoverClass="hover:bg-green-100/50 dark:hover:bg-green-950/30"
            showDecimals={showDecimals}
          />
          
          {/* Monthly Profit - Blue */}
          <MetricRow
            label={t('costs.monthlyProfit')}
            icon={DollarSign}
            iconColor="text-blue-500"
            data={monthlyData.map(data => ({ value: data.monthlyProfit }))}
            isPositive={true}
            bgClass="bg-blue-50/70 dark:bg-blue-950/20"
            hoverClass="hover:bg-blue-100 dark:hover:bg-blue-950/30"
            showDecimals={showDecimals}
          />
          
          {/* Monthly Profit % - Light Blue */}
          <MetricRow
            label={t('costs.monthlyProfitPercentage')}
            icon={Percent}
            iconColor="text-blue-500/80"
            data={monthlyData.map(data => ({ 
              value: data.monthlyProfitPercentage,
              isPercentage: true 
            }))}
            isPositive={true}
            bgClass="bg-blue-50/40 dark:bg-blue-950/10"
            hoverClass="hover:bg-blue-100/40 dark:hover:bg-blue-950/20"
            showDecimals={showDecimals}
          />
          
          {/* Accumulated Profit - Purple */}
          <MetricRow
            label={t('costs.accumulatedProfit')}
            icon={BarChart3}
            iconColor="text-purple-500"
            data={monthlyData.map(data => ({ value: data.accumulatedProfit }))}
            isPositive={true}
            bgClass="bg-purple-50/70 dark:bg-purple-950/20"
            hoverClass="hover:bg-purple-100 dark:hover:bg-purple-950/30"
            showDecimals={showDecimals}
          />
          
          {/* Accumulated Profit % - Light Purple */}
          <MetricRow
            label={t('costs.accumulatedProfitPercentage')}
            icon={PieChart}
            iconColor="text-purple-500/80"
            data={monthlyData.map(data => ({ 
              value: data.accumulatedProfitPercentage,
              isPercentage: true 
            }))}
            isPositive={true}
            bgClass="bg-purple-50/40 dark:bg-purple-950/10"
            hoverClass="hover:bg-purple-100/40 dark:hover:bg-purple-950/20"
            showDecimals={showDecimals}
          />
        </TableBody>
      </Table>
    </SynchronizedTableContainer>
  );
}
