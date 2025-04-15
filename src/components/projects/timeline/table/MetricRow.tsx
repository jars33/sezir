
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
}: MetricRowProps & { showDecimals?: boolean }) {
  return (
    <TableRow className={`${bgClass} ${hoverClass}`}>
      <TableCell className={`sticky left-0 z-10 ${bgClass} font-medium`}>
        <div className="flex items-center">
          <Icon className={`mr-2 h-4 w-4 ${iconColor}`} />
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
