
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { metrics, isLoading } = useDashboardMetrics();

  const stats = [
    { name: 'Active Projects', value: metrics.activeProjects.toString() },
    { name: 'Team Members', value: metrics.teamMembers.toString() },
    { name: 'Avg. Project Profitability', value: `${metrics.avgProjectProfitability}%` },
    { name: 'Resource Utilization', value: `${metrics.resourceUtilization}%` },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      </div>

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

      <Card className="w-full">
        <div className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Revenue vs Cost
          </h2>
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[70%] w-[90%]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis tickFormatter={(value) => `€${value}`} className="text-muted-foreground" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `€${value.toFixed(2)}`,
                      name
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    className="fill-emerald-500 dark:fill-emerald-400"
                  />
                  <Bar 
                    dataKey="cost" 
                    name="Cost" 
                    className="fill-red-500 dark:fill-red-400"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
