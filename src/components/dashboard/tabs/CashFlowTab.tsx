
import { Card } from "@/components/ui/card";
import { 
  ComposedChart, 
  Bar, 
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

interface CashFlowTabProps {
  cashFlowData: any[];
  isLoading: boolean;
}

export function CashFlowTab({ cashFlowData, isLoading }: CashFlowTabProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="w-full">
      <div className="p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          {t('dashboard.tabs.cashFlow')}
        </h2>
        <div className="h-80 w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-[70%] w-[90%]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cashFlowData}
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
                    
                    // Translate common terms
                    if (name === "revenue") translatedName = t('dashboard.charts.revenue');
                    if (name === "variableCosts") translatedName = t('costs.variableCost');
                    if (name === "overheadCosts") translatedName = t('costs.overheadCost');
                    if (name === "salaryCosts") translatedName = "Salary Costs"; // Add translation if available
                    if (name === "netCashFlow") translatedName = "Net Cash Flow"; // Add translation if available
                    
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
                    // Translate legend labels
                    if (value === "Revenue") return t('dashboard.charts.revenue');
                    if (value === "Variable Costs") return t('costs.variableCost');
                    if (value === "Overhead Costs") return t('costs.overheadCost');
                    if (value === "Salary Costs") return "Salary Costs"; // Add translation if available
                    if (value === "Net Cash Flow") return "Net Cash Flow"; // Add translation if available
                    return value;
                  }}
                />
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
  );
}
