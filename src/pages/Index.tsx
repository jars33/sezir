
import { useState } from "react";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import YearTeamFilter from "@/components/dashboard/YearTeamFilter";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const { metrics, isLoading } = useDashboardMetrics({
    year: selectedYear,
    teamId: selectedTeam
  });

  const stats = [
    { name: 'Active Projects', value: metrics.activeProjects.toString() },
    { name: 'Team Members', value: metrics.teamMembers.toString() },
    { name: 'Avg. Project Profitability', value: `${metrics.avgProjectProfitability}%` },
    { name: 'Resource Utilization', value: `${metrics.resourceUtilization}%` },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground dark:text-white">{t('common.dashboard')}</h1>
      </div>

      <YearTeamFilter
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
      />

      <StatsCards stats={stats} isLoading={isLoading} />

      <DashboardTabs metrics={metrics} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
