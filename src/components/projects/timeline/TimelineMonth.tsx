
import { format } from "date-fns"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface AllocationItem {
  id: string
  month: string
  allocation_percentage: number
  team_member_name: string
}

interface TimelineMonthProps {
  month: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  overheadCosts: TimelineItem[]
  allocations: AllocationItem[]
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectOverheadCost: (cost: TimelineItem) => void
  onSelectAllocation?: (allocation: AllocationItem) => void
}

export function TimelineMonth({
  month,
  revenues,
  variableCosts,
  overheadCosts,
  allocations,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectOverheadCost,
  onSelectAllocation,
}: TimelineMonthProps) {
  const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalVariableCosts = variableCosts.reduce((sum, c) => sum + Number(c.amount), 0)
  const totalOverheadCosts = overheadCosts.reduce((sum, c) => sum + Number(c.amount), 0)
  const monthlyTotal = totalRevenue - totalVariableCosts - totalOverheadCosts

  return (
    <div className="bg-white p-4 min-h-[250px] flex flex-col">
      <div className="text-sm font-medium mb-4">
        {format(month, "MMM yyyy")}
      </div>

      <div className="flex-1 space-y-2">
        {/* Allocations */}
        {allocations.map((allocation) => (
          <div
            key={allocation.id}
            onClick={() => onSelectAllocation?.(allocation)}
            className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition-colors"
          >
            {allocation.allocation_percentage}%
          </div>
        ))}

        {/* Revenues */}
        {revenues.map((revenue) => (
          <div
            key={revenue.id}
            onClick={() => onSelectRevenue(revenue)}
            className="p-2 bg-green-50 border border-green-100 rounded-lg text-center cursor-pointer hover:bg-green-100 transition-colors"
          >
            €{revenue.amount.toFixed(2)}
          </div>
        ))}

        {/* Variable Costs */}
        {variableCosts.map((cost) => (
          <div
            key={cost.id}
            onClick={() => onSelectVariableCost(cost)}
            className="p-2 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
          >
            <div className="text-center">-€{cost.amount.toFixed(2)}</div>
            {cost.description && (
              <div className="text-sm text-gray-600 text-center mt-1">
                {cost.description}
              </div>
            )}
          </div>
        ))}

        {/* Overhead Costs */}
        {overheadCosts.map((cost) => (
          <div
            key={cost.id}
            onClick={() => onSelectOverheadCost(cost)}
            className="p-2 bg-orange-50 border border-orange-100 rounded-lg text-center cursor-pointer hover:bg-orange-100 transition-colors"
          >
            -€{cost.amount.toFixed(2)}
          </div>
        ))}
      </div>

      {/* Monthly Total */}
      <div className={`mt-4 text-center font-medium ${
        monthlyTotal >= 0 
          ? "text-green-600" 
          : "text-red-600"
      }`}>
        €{monthlyTotal.toFixed(2)}
      </div>
    </div>
  )
}
