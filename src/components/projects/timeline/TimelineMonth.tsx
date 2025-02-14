
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
  salary_cost: number
  team_member_id: string
  project_assignment_id: string
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
  const totalRevenue = revenues.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const totalVariableCosts = variableCosts.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const totalOverheadCosts = overheadCosts.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  const totalSalaryCosts = allocations.reduce((sum, a) => sum + (Number(a.salary_cost) || 0), 0)
  const profit = totalRevenue - totalVariableCosts - totalOverheadCosts - totalSalaryCosts

  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "0.00"
    return amount.toFixed(2)
  }

  return (
    <div className="bg-card p-2 flex flex-col rounded-lg border border-border">
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-medium text-foreground">{format(month, "MMM yyyy")}</h3>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 grid grid-rows-[auto_1fr] gap-4">
        {/* Revenues Section - Top Row */}
        <div className="space-y-1">
          {revenues.length > 0 ? (
            revenues.map((revenue) => (
              <div
                key={revenue.id}
                onClick={() => onSelectRevenue(revenue)}
                className="p-2 min-h-[40px] flex items-center justify-center bg-emerald-950/30 border border-emerald-500/20 rounded text-sm cursor-pointer hover:bg-emerald-950/40 w-full text-center text-emerald-400"
              >
                €{formatAmount(revenue.amount)}
              </div>
            ))
          ) : (
            <div className="p-2 min-h-[40px] flex items-center justify-center bg-muted/30 border border-border rounded text-sm text-muted-foreground w-full text-center">
              €0.00
            </div>
          )}
        </div>

        {/* Costs Section - Bottom Row */}
        <div className="space-y-1">
          {/* Allocations */}
          {allocations.map((allocation) => (
            <div
              key={allocation.id}
              onClick={() => onSelectAllocation?.(allocation)}
              className="p-2 min-h-[50px] bg-blue-950/30 border border-blue-500/20 rounded text-sm cursor-pointer hover:bg-blue-950/40 w-full"
            >
              <div className="text-center text-blue-400">-€{formatAmount(allocation.salary_cost)}</div>
              <div className="text-xs text-muted-foreground text-center">{allocation.team_member_name}</div>
            </div>
          ))}

          {/* Variable Costs */}
          {variableCosts.map((cost) => (
            <div
              key={cost.id}
              onClick={() => onSelectVariableCost(cost)}
              className="p-2 min-h-[40px] bg-red-950/30 border border-red-500/20 rounded text-sm cursor-pointer hover:bg-red-950/40 w-full"
            >
              <div className="text-center text-red-400">-€{formatAmount(cost.amount)}</div>
              {cost.description && (
                <div className="text-xs text-muted-foreground text-center">{cost.description}</div>
              )}
            </div>
          ))}

          {/* Overhead Costs */}
          {overheadCosts.map((cost) => (
            <div
              key={cost.id}
              onClick={() => onSelectOverheadCost(cost)}
              className="p-2 min-h-[40px] flex items-center justify-center bg-amber-950/30 border border-amber-500/20 rounded text-sm cursor-pointer hover:bg-amber-950/40 w-full text-center text-amber-400"
            >
              -€{formatAmount(cost.amount)}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Profit */}
      <div className={`mt-2 text-sm font-medium text-center ${
        profit >= 0 
          ? "text-emerald-400"
          : "text-red-400"
      }`}>
        €{formatAmount(profit)}
      </div>
    </div>
  )
}
