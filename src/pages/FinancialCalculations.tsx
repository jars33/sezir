
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { calculationsService } from "@/services/supabase";
import YearTeamFilter from "@/components/dashboard/YearTeamFilter";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function FinancialCalculations() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["financial-calculations", selectedYear, selectedTeam],
    queryFn: () => calculationsService.calculateFinancialMetrics(selectedYear, selectedTeam)
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground dark:text-white">
          {t('common.financialCalculations')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed breakdown of how financial metrics are calculated
        </p>
      </div>

      <YearTeamFilter
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />

      {/* Chart visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monthly Revenue, Cost and Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[70%] w-[90%]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data?.monthlyData || []}
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
        </CardContent>
      </Card>

      {/* Raw data and calculation details */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Revenue</TableCell>
                      <TableCell>€{data?.totals.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Variable Costs</TableCell>
                      <TableCell>€{data?.totals.variableCosts.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Overhead Costs</TableCell>
                      <TableCell>€{data?.totals.overheadCosts.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Salary Costs</TableCell>
                      <TableCell>€{data?.totals.salaryCosts.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-medium">
                      <TableCell>Total Costs</TableCell>
                      <TableCell>€{data?.totals.totalCosts.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell>Profit</TableCell>
                      <TableCell>€{data?.totals.profit.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Monthly Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.monthlyData.map((month, i) => (
                      <TableRow key={i}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell>€{month.revenue.toFixed(2)}</TableCell>
                        <TableCell>€{month.cost.toFixed(2)}</TableCell>
                        <TableCell>€{month.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
