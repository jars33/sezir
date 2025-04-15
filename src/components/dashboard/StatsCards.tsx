
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";

interface Stat {
  name: string;
  value: string;
}

interface StatsCardsProps {
  stats: Stat[];
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground truncate">
              {t(`dashboard.${stat.name.toLowerCase().replace(/\s/g, '')}`)}
            </div>
          </div>
          <div className="mt-1">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-semibold text-foreground">
                {stat.value}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
