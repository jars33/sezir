
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4000, cost: 2400 },
  { month: 'Feb', revenue: 3000, cost: 1398 },
  { month: 'Mar', revenue: 2000, cost: 9800 },
  { month: 'Apr', revenue: 2780, cost: 3908 },
  { month: 'May', revenue: 1890, cost: 4800 },
  { month: 'Jun', revenue: 2390, cost: 3800 },
];

const stats = [
  { name: 'Active Projects', value: '12' },
  { name: 'Team Members', value: '24' },
  { name: 'Avg. Project Profitability', value: '32%' },
  { name: 'Resource Utilization', value: '87%' },
];

const Dashboard = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-4">
            <div>
              <div className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </div>
            </div>
            <div className="mt-1">
              <div className="text-3xl font-semibold text-gray-900">
                {stat.value}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="w-full">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Revenue vs Cost
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#86efac" />
                <Bar dataKey="cost" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
