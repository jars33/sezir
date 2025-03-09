
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area
} from 'recharts';
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import YearTeamFilter from "@/components/dashboard/YearTeamFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const { metrics, isLoading } = useDashboardMetrics({
    year: selectedYear,
    teamId: selectedTeam
  });

  const stats = [
    { name: 'Active Projects', value: metrics.activeProjects.toString() },
    { name: 'Team Members', value: metrics.teamMembers.toString() },
    { name: 'Avg. Project Profitability', value: `${metrics.avgProjectProfitability}%` },
    { name: 'Resource Utilization', value: `${metrics.resourceUtilization}%` },
  ];

  // Calculate profit data for each month
  const chartData = metrics.chartData?.map(item => ({
    ...item,
    profit: item.revenue - item.cost
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      </div>

      <YearTeamFilter
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground truncate">
                {stat.name}
              </div>
            </div>
            <div className="mt-1">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-semibold text-foreground">
                  {stat.value}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue & Costs</TabsTrigger>
          <TabsTrigger value="project-margins">Project Margins</TabsTrigger>
          <TabsTrigger value="utilization">Utilization vs Profitability</TabsTrigger>
          <TabsTrigger value="forecast">Financial Forecast</TabsTrigger>
          <TabsTrigger value="cost-breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="year-comparison">Year Comparison</TabsTrigger>
        </TabsList>
        
        {/* Revenue & Costs Tab */}
        <TabsContent value="revenue">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Revenue, Cost & Profit
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis 
                        tickFormatter={(value) => `€${value}`} 
                        className="text-muted-foreground" 
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `€${value.toFixed(2)}`,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone"
                        dataKey="revenue" 
                        name="Revenue" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="cost" 
                        name="Cost" 
                        stroke="#F97316" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="profit" 
                        name="Profit" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Project Margins Tab */}
        <TabsContent value="project-margins">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Project Margin Analysis
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={metrics.projectMargins.slice(0, 10)} // Show only top 10
                      margin={{
                        top: 20,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis 
                        type="number" 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `${value}%`}
                        className="text-muted-foreground" 
                      />
                      <YAxis 
                        dataKey="projectName" 
                        type="category" 
                        width={80}
                        className="text-muted-foreground"
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}%`,
                          'Margin'
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="margin" 
                        name="Margin" 
                        fill="#10B981"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Utilization vs Profitability Tab */}
        <TabsContent value="utilization">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Team Utilization vs. Profitability
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis 
                        type="number" 
                        dataKey="utilization" 
                        name="Utilization" 
                        unit="%" 
                        domain={[0, 100]}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="profitability" 
                        name="Profitability" 
                        unit="%" 
                        domain={[-50, 150]}
                        className="text-muted-foreground"
                      />
                      <ZAxis 
                        type="number" 
                        range={[100, 500]} 
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value: number, name: string) => [
                          `${value}%`,
                          name
                        ]}
                        labelFormatter={(label) => null}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Scatter 
                        name="Projects" 
                        data={metrics.utilizationProfitabilityData} 
                        fill="#8884D8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Financial Forecast Tab */}
        <TabsContent value="forecast">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Financial Forecast
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={metrics.forecastData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis 
                        tickFormatter={(value) => `€${value}`} 
                        className="text-muted-foreground" 
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          value ? `€${value.toFixed(2)}` : 'N/A',
                          name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone"
                        dataKey="actualRevenue" 
                        name="Actual Revenue" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        dot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="actualCost" 
                        name="Actual Cost" 
                        stroke="#F97316" 
                        strokeWidth={2}
                        dot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="projectedRevenue" 
                        name="Projected Revenue" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="projectedCost" 
                        name="Projected Cost" 
                        stroke="#F97316" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Cost Breakdown Tab */}
        <TabsContent value="cost-breakdown">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Cost Breakdown
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metrics.costBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="category"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {metrics.costBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`€${value.toFixed(2)}`, 'Amount']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <div className="h-full flex flex-col justify-center">
                        <h3 className="text-md font-medium mb-4">Cost Distribution</h3>
                        <ul className="space-y-4">
                          {metrics.costBreakdown.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <div 
                                className="w-4 h-4 mr-2 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span>{item.category}</span>
                                  <span className="font-medium">€{item.value.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: `${item.percentage}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  />
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Cash Flow Tab */}
        <TabsContent value="cash-flow">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Cash Flow Analysis
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={metrics.cashFlowData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis 
                        tickFormatter={(value) => `€${value}`} 
                        className="text-muted-foreground" 
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `€${value.toFixed(2)}`,
                          name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="revenue" 
                        name="Revenue" 
                        fill="#10B981" 
                        stackId="a"
                      />
                      <Bar 
                        dataKey="variableCosts" 
                        name="Variable Costs" 
                        fill="#F97316" 
                        stackId="b"
                      />
                      <Bar 
                        dataKey="overheadCosts" 
                        name="Overhead Costs" 
                        fill="#F59E0B" 
                        stackId="b"
                      />
                      <Bar 
                        dataKey="salaryCosts" 
                        name="Salary Costs" 
                        fill="#EF4444" 
                        stackId="b"
                      />
                      <Line 
                        type="monotone"
                        dataKey="netCashFlow" 
                        name="Net Cash Flow" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ r: 5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Year Comparison Tab */}
        <TabsContent value="year-comparison">
          <Card className="w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Year-over-Year Comparison
              </h2>
              <div className="h-80 w-full">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-[70%] w-[90%]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={metrics.yearComparisonData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis 
                        tickFormatter={(value) => `€${value}`} 
                        className="text-muted-foreground" 
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `€${value.toFixed(2)}`,
                          name.replace(/([A-Z])/g, ' $1').replace(/([a-z])([A-Z])/g, '$1 $2')
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone"
                        dataKey="currentYearRevenue" 
                        name="Current Year Revenue" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="previousYearRevenue" 
                        name="Previous Year Revenue" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="currentYearProfit" 
                        name="Current Year Profit" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone"
                        dataKey="previousYearProfit" 
                        name="Previous Year Profit" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
