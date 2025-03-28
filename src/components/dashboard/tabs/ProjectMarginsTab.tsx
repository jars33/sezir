
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface ProjectMarginsTabProps {
  projectMargins: any[];
  isLoading: boolean;
}

export function ProjectMarginsTab({ projectMargins, isLoading }: ProjectMarginsTabProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="w-full">
      <div className="p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          {t('dashboard.tabs.projectMargins')}
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
                data={projectMargins.slice(0, 10)} // Show only top 10
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
                  formatter={(value: number, name: string) => {
                    // Translate margin label
                    let translatedName = name === "margin" ? t('costs.rentability') : name;
                    
                    return [
                      `${value.toFixed(1)}%`,
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
                    return value === "Margin" ? t('costs.rentability') : value;
                  }}
                />
                <Bar 
                  dataKey="margin" 
                  name="Margin" 
                  radius={[0, 4, 4, 0]}
                  fill="#10B981" // Default fill color
                >
                  {/* Use Cell components to conditionally style each bar */}
                  {projectMargins.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.margin < 0 ? '#ef4444' : '#10B981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
