
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
  // Find the transition point between actual and projected data
  const findTransitionIndex = (dataKey: string) => {
    if (!forecastData || forecastData.length === 0) return -1;
    
    for (let i = 0; i < forecastData.length - 1; i++) {
      // If current month has actual data and next month has projected data
      if (
        forecastData[i]?.[dataKey] !== null && 
        forecastData[i]?.[dataKey] !== undefined &&
        forecastData[i + 1]?.[`projected${dataKey.charAt(0).toUpperCase() + dataKey.slice(1).replace(/^actual/, '')}`] !== null && 
        forecastData[i + 1]?.[`projected${dataKey.charAt(0).toUpperCase() + dataKey.slice(1).replace(/^actual/, '')}`] !== undefined
      ) {
        return i;
      }
    }
    return -1;
  };

  // Create connecting data for dotted lines
  const createConnectorData = () => {
    const revenueTransitionIndex = findTransitionIndex('actualRevenue');
    const costTransitionIndex = findTransitionIndex('actualCost');
    
    const connectorData = [];
    
    if (revenueTransitionIndex >= 0 && revenueTransitionIndex + 1 < forecastData.length) {
      const lastActualMonth = forecastData[revenueTransitionIndex];
      const firstProjectedMonth = forecastData[revenueTransitionIndex + 1];
      
      if (lastActualMonth && firstProjectedMonth && 
          lastActualMonth.actualRevenue !== null && 
          lastActualMonth.actualRevenue !== undefined &&
          firstProjectedMonth.projectedRevenue !== null && 
          firstProjectedMonth.projectedRevenue !== undefined) {
        connectorData.push({
          dataKey: 'revenueConnector',
          startMonth: lastActualMonth.month,
          endMonth: firstProjectedMonth.month,
          startValue: lastActualMonth.actualRevenue,
          endValue: firstProjectedMonth.projectedRevenue
        });
      }
    }
    
    if (costTransitionIndex >= 0 && costTransitionIndex + 1 < forecastData.length) {
      const lastActualMonth = forecastData[costTransitionIndex];
      const firstProjectedMonth = forecastData[costTransitionIndex + 1];
      
      if (lastActualMonth && firstProjectedMonth && 
          lastActualMonth.actualCost !== null && 
          lastActualMonth.actualCost !== undefined &&
          firstProjectedMonth.projectedCost !== null && 
          firstProjectedMonth.projectedCost !== undefined) {
        connectorData.push({
          dataKey: 'costConnector',
          startMonth: lastActualMonth.month,
          endMonth: firstProjectedMonth.month,
          startValue: lastActualMonth.actualCost,
          endValue: firstProjectedMonth.projectedCost
        });
      }
    }
    
    return connectorData;
  };
  
  // Add connector lines to the chart
  const renderConnectorLines = () => {
    const connectors = createConnectorData();
    
    return connectors.map((connector, index) => {
      const isRevenue = connector.dataKey === 'revenueConnector';
      const strokeColor = isRevenue ? '#0EA5E9' : '#F97316';
      
      // Custom data for this line only
      const lineData = [
        { month: connector.startMonth, value: connector.startValue },
        { month: connector.endMonth, value: connector.endValue }
      ];
      
      return (
        <Line
          key={connector.dataKey}
          data={lineData}
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          name={isRevenue ? "Revenue Transition" : "Cost Transition"}
          connectNulls={true}
        />
      );
    });
  };

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
                  connectNulls={true}
                />
                <Line 
                  type="monotone"
                  dataKey="actualCost" 
                  name="Actual Cost" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  connectNulls={true}
                />
                <Line 
                  type="monotone"
                  dataKey="projectedRevenue" 
                  name="Projected Revenue" 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  connectNulls={true}
                />
                <Line 
                  type="monotone"
                  dataKey="projectedCost" 
                  name="Projected Cost" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  connectNulls={true}
                />
                {renderConnectorLines()}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
