
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
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface RevenueTabProps {
  chartData: any[];
  isLoading: boolean;
  selectedYear: number;
  overheadPercentage: number;
}

export function RevenueTab({ chartData, isLoading, selectedYear, overheadPercentage }: RevenueTabProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-foreground">
            {t('dashboard.charts.revenueCostProfit')}
          </h2>
          <div className="text-sm text-muted-foreground">
            {t('costs.overhead')}: {overheadPercentage}%
          </div>
        </div>
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
                  formatter={(value: number, name: string) => {
                    let translatedName = name;
                    if (name === "revenue") translatedName = t('dashboard.charts.revenue');
                    if (name === "cost") translatedName = t('dashboard.charts.cost');
                    if (name === "profit") translatedName = t('dashboard.charts.profit');
                    
                    return [
                      `€${value.toFixed(2)}`,
                      translatedName
                    ];
                  }}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === "revenue") return t('dashboard.charts.revenue');
                    if (value === "cost") return t('dashboard.charts.cost');
                    if (value === "profit") return t('dashboard.charts.profit');
                    return value;
                  }}
                />
                <Line 
                  type="monotone"
                  dataKey="revenue" 
                  name="revenue" 
                  stroke="#4CAF50" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone"
                  dataKey="cost" 
                  name="cost" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone"
                  dataKey="profit" 
                  name="profit" 
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
  );
}
