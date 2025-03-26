
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueTab } from "./tabs/RevenueTab";
import { ProjectMarginsTab } from "./tabs/ProjectMarginsTab";
import { UtilizationTab } from "./tabs/UtilizationTab";
import { CostBreakdownTab } from "./tabs/CostBreakdownTab";
import { CashFlowTab } from "./tabs/CashFlowTab";
import { YearComparisonTab } from "./tabs/YearComparisonTab";

interface DashboardTabsProps {
  metrics: any;
  isLoading: boolean;
}

export function DashboardTabs({ metrics, isLoading }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="revenue" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="revenue">Revenue & Costs</TabsTrigger>
        <TabsTrigger value="project-margins">Project Margins</TabsTrigger>
        <TabsTrigger value="utilization">Utilization vs Profitability</TabsTrigger>
        <TabsTrigger value="cost-breakdown">Cost Breakdown</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        <TabsTrigger value="year-comparison">Year Comparison</TabsTrigger>
      </TabsList>
      
      {/* Revenue & Costs Tab */}
      <TabsContent value="revenue">
        <RevenueTab 
          chartData={metrics.chartData} 
          isLoading={isLoading} 
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
