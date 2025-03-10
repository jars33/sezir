
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
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectMarginsTabProps {
  projectMargins: any[];
  isLoading: boolean;
}

export function ProjectMarginsTab({ projectMargins, isLoading }: ProjectMarginsTabProps) {
  return (
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
                  radius={[0, 4, 4, 0]}
                  fill={(entry) => entry.margin < 0 ? '#ef4444' : '#10B981'} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
