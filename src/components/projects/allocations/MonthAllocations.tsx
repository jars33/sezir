
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { AllocationData } from "./types";
import { AllocationItem } from "./AllocationItem";

interface MonthAllocationsProps {
  month: Date;
  allocations: AllocationData[];
  onAllocationClick: (allocation: AllocationData) => void;
}

export function MonthAllocations({ month, allocations, onAllocationClick }: MonthAllocationsProps) {
  const { t } = useTranslation();
  
  const getMonthKey = (monthDate: Date) => {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return monthNames[monthDate.getMonth()];
  };

  const monthStr = format(month, "yyyy-MM");
  const monthAllocations = allocations.filter(allocation => 
    format(new Date(allocation.month), "yyyy-MM") === monthStr
  );

  return (
    <div className="bg-white p-2 min-h-[250px] flex flex-col">
      <div className="flex items-center justify-center gap-1 mb-1">
        <div className="text-sm font-medium">
          {t(`common.months.${getMonthKey(month)}`)} {month.getFullYear()}
        </div>
      </div>
      <div className="flex-1 space-y-1">
        {monthAllocations.map((allocation) => (
          <AllocationItem 
            key={allocation.id} 
            allocation={allocation} 
            onClick={onAllocationClick} 
          />
        ))}
      </div>
    </div>
  );
}
