
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueTab } from "./tabs/RevenueTab";
import { ProjectMarginsTab } from "./tabs/ProjectMarginsTab";
import { UtilizationTab } from "./tabs/UtilizationTab";
import { CostBreakdownTab } from "./tabs/CostBreakdownTab";
import { CashFlowTab } from "./tabs/CashFlowTab";
import { YearComparisonTab } from "./tabs/YearComparisonTab";
import { useTranslation } from "react-i18next";

interface DashboardTabsProps {
  metrics: any;
  isLoading: boolean;
  selectedYear: number;
  overheadPercentage: number;
}

export function DashboardTabs({ metrics, isLoading, selectedYear, overheadPercentage }: DashboardTabsProps) {
  const { t } = useTranslation();
  
  return (
    <Tabs defaultValue="revenue" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="revenue">{t('dashboard.tabs.revenueCosts')}</TabsTrigger>
        <TabsTrigger value="project-margins">{t('dashboard.tabs.projectMargins')}</TabsTrigger>
        <TabsTrigger value="utilization">{t('dashboard.tabs.utilizationProfitability')}</TabsTrigger>
        <TabsTrigger value="cost-breakdown">{t('dashboard.tabs.costBreakdown')}</TabsTrigger>
        <TabsTrigger value="cash-flow">{t('dashboard.tabs.cashFlow')}</TabsTrigger>
        <TabsTrigger value="year-comparison">{t('dashboard.tabs.yearComparison')}</TabsTrigger>
      </TabsList>
      
      {/* Revenue & Costs Tab */}
      <TabsContent value="revenue">
        <RevenueTab 
          chartData={metrics.chartData} 
          isLoading={isLoading} 
          selectedYear={selectedYear}
          overheadPercentage={overheadPercentage}
        />
      </TabsContent>
      
      {/* Project Margins Tab */}
      <TabsContent value="project-margins">
        <ProjectMarginsTab 
          projectMargins={metrics.projectMargins} 
          isLoading={isLoading} 
        />
      </TabsContent>
      
      {/* Utilization vs Profitability Tab */}
      <TabsContent value="utilization">
        <UtilizationTab 
          utilizationProfitabilityData={metrics.utilizationProfitabilityData} 
          isLoading={isLoading} 
        />
      </TabsContent>
      
      {/* Cost Breakdown Tab */}
      <TabsContent value="cost-breakdown">
        <CostBreakdownTab 
          costBreakdown={metrics.costBreakdown} 
          isLoading={isLoading} 
        />
      </TabsContent>
      
      {/* Cash Flow Tab */}
      <TabsContent value="cash-flow">
        <CashFlowTab 
          cashFlowData={metrics.cashFlowData} 
          isLoading={isLoading} 
        />
      </TabsContent>
      
      {/* Year Comparison Tab */}
      <TabsContent value="year-comparison">
        <YearComparisonTab 
          yearComparisonData={metrics.yearComparisonData} 
          isLoading={isLoading} 
        />
      </TabsContent>
    </Tabs>
  );
}
