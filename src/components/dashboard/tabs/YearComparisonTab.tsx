
import { Card } from "@/components/ui/card";
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface YearComparisonTabProps {
  yearComparisonData: any[];
  isLoading: boolean;
}

export function YearComparisonTab({ yearComparisonData, isLoading }: YearComparisonTabProps) {
  return (
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
                data={yearComparisonData}
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
  );
}
