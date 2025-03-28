
import { Card } from "@/components/ui/card";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface UtilizationTabProps {
  utilizationProfitabilityData: any[];
  isLoading: boolean;
}

export function UtilizationTab({ utilizationProfitabilityData, isLoading }: UtilizationTabProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="w-full">
      <div className="p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          {t('dashboard.charts.teamUtilizationProfitability')}
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
                  name={t('dashboard.charts.utilization')} 
                  unit="%" 
                  domain={[0, 100]}
                  className="text-muted-foreground"
                />
                <YAxis 
                  type="number" 
                  dataKey="profitability" 
                  name={t('dashboard.charts.profitability')} 
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
                    `${value}`, // Removed % since we add it through labelFormatter
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
                  name={t('dashboard.projects')} 
                  data={utilizationProfitabilityData} 
                  fill="#8884D8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
