
import { TableCell, TableRow } from "@/components/ui/table";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage, getValueColorClass } from "../utils/formatting";

interface MetricRowProps {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  data: {
    value: number;
    isPercentage?: boolean;
  }[];
  isPositive: boolean;
  bgClass: string;
  hoverClass: string;
  showDecimals?: boolean;
}

export function MetricRow({
  label,
  icon: Icon,
  iconColor,
  data,
  isPositive,
  bgClass,
  hoverClass,
  showDecimals = true
}: MetricRowProps) {
  return (
    <TableRow className={cn(bgClass, hoverClass)}>
      <TableCell className={cn(
        "sticky left-0 z-20 w-[180px] font-medium border-r", 
        bgClass,
        "after:absolute after:top-0 after:right-0 after:border-r after:h-full after:border-border"
      )}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconColor)} />
          {label}
        </div>
      </TableCell>
      {data.map((item, index) => (
        <TableCell 
          key={index} 
          className={cn(
            "text-right", 
            getValueColorClass(item.value, isPositive)
          )}
        >
          {item.isPercentage ? 
            formatPercentage(item.value, showDecimals) : 
            formatCurrency(item.value, showDecimals)}
        </TableCell>
      ))}
    </TableRow>
  );
}
