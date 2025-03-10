
import { Card } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CostBreakdownTabProps {
  costBreakdown: any[];
  isLoading: boolean;
}

export function CostBreakdownTab({ costBreakdown, isLoading }: CostBreakdownTabProps) {
  return (
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
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {costBreakdown.map((entry, index) => (
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
                    {costBreakdown.map((item, index) => (
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
  );
}
