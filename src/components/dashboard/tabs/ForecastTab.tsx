
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

interface ForecastTabProps {
  forecastData: any[];
  isLoading: boolean;
}

export function ForecastTab({ forecastData, isLoading }: ForecastTabProps) {
  // Find transition points for the connector lines
  const findTransitionPoints = () => {
    if (!forecastData || forecastData.length === 0) return null;

    let lastActualIndex = -1;
    let firstProjectedIndex = -1;

    for (let i = 0; i < forecastData.length; i++) {
      const month = forecastData[i];
      if (month.actualRevenue !== null) {
        lastActualIndex = i;
      } else if (firstProjectedIndex === -1 && month.projectedRevenue !== null) {
        firstProjectedIndex = i;
        break;
      }
    }

    if (lastActualIndex >= 0 && firstProjectedIndex >= 0) {
      return {
        lastActual: forecastData[lastActualIndex],
        firstProjected: forecastData[firstProjectedIndex],
        lastActualIndex,
        firstProjectedIndex
      };
    }
    return null;
  };

  const transitionPoints = findTransitionPoints();
  
  // Create connector data points if transition points exist
  const connectorData = transitionPoints ? [
    {
      month: transitionPoints.lastActual.month,
      revenueConnector: transitionPoints.lastActual.actualRevenue,
      costConnector: transitionPoints.lastActual.actualCost,
    },
    {
      month: transitionPoints.firstProjected.month,
      revenueConnector: transitionPoints.firstProjected.projectedRevenue,
      costConnector: transitionPoints.firstProjected.projectedCost,
    }
  ] : [];

  return (
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
                data={forecastData}
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
                
                {/* Connector lines between actual and projected data */}
                {transitionPoints && (
                  <>
                    <Line 
                      data={connectorData}
                      type="monotone"
                      dataKey="revenueConnector" 
                      name="Revenue Connector"
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                    />
                    <Line 
                      data={connectorData}
                      type="monotone"
                      dataKey="costConnector" 
                      name="Cost Connector"
                      stroke="#F97316" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
