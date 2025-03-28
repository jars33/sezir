
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import type { AllocationData } from "./types"
import { useTranslation } from "react-i18next"

interface MonthAllocationProps {
  month: Date
  allocations: AllocationData[]
  currentDate: Date
}

export function MonthAllocation({ month, allocations, currentDate }: MonthAllocationProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const monthStr = format(month, "yyyy-MM")
  const monthAllocations = allocations?.filter(allocation => 
    format(new Date(allocation.month), "yyyy-MM") === monthStr
  ) || []
  
  const totalAllocation = monthAllocations.reduce(
    (sum, allocation) => sum + allocation.allocation_percentage, 
    0
  )

  const getMonthColor = (totalAllocation: number) => {
    if (totalAllocation > 100) return 'dark:bg-red-900/50 bg-red-50'
    if (totalAllocation === 100) return 'dark:bg-green-900/50 bg-green-50'
    if (totalAllocation > 0) return 'dark:bg-yellow-900/50 bg-yellow-50'
    return 'dark:bg-gray-800 bg-white'
  }

  const isCurrentMonth = (month: Date) => {
    return month.getMonth() === currentDate.getMonth() && 
           month.getFullYear() === currentDate.getFullYear()
  }

  const handleAllocationClick = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  // Get month name based on the month number
  const getMonthKey = (month: Date) => {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    return monthNames[month.getMonth()]
  }

  return (
    <div 
      key={month.getTime()} 
      className={`p-2 min-h-[70px] ${getMonthColor(totalAllocation)} ${
        isCurrentMonth(month) ? 'ring-2 ring-blue-500 ring-inset dark:ring-blue-300' : ''
      }`}
    >
      <div className="text-center mb-1">
        <div className={'text-xs font-medium ' + (isCurrentMonth(month) ? 'text-blue-800 dark:text-blue-300' : '')}>
          {t(`common.months.${getMonthKey(month)}`)} {month.getFullYear()}
        </div>
        <div className={'text-xs font-medium ' + (
          totalAllocation > 100 ? 'text-red-700 dark:text-red-400' :
          totalAllocation === 100 ? 'text-green-700 dark:text-green-400' :
          totalAllocation > 0 ? 'text-yellow-700 dark:text-yellow-400' :
          isCurrentMonth(month) ? 'text-blue-800 dark:text-blue-300' : ''
        )}>
          {totalAllocation}%
        </div>
      </div>
      <div className="text-center space-y-1">
        {monthAllocations.map((allocation) => (
          <div
            key={allocation.id}
            onClick={() => handleAllocationClick(allocation.project.id)}
            className="text-xs p-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={`${allocation.project.name} (${allocation.project.number})`}
          >
            <div className="truncate text-gray-600 dark:text-gray-400">
              {allocation.project.name}
            </div>
            <div className="font-medium">
              {allocation.allocation_percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
