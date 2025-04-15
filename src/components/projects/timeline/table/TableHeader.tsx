
import { useTranslation } from "react-i18next";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderProps {
  months: Date[];
}

export function TimelineTableHeader({ months }: TableHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead className="sticky left-0 z-10 bg-muted/50 w-[180px] font-medium">
          {t('costs.metric')}
        </TableHead>
        {months.map((month) => (
          <TableHead key={month.getTime()} className="text-right font-medium">
            {t(`common.months.${month.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`)}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
