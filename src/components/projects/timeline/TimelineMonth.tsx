
import { format } from "date-fns"

interface TimelineItem {
  id: string
  month: string
  amount: number
  description?: string
}

interface TimelineMonthProps {
  month: Date
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  overheadCosts: TimelineItem[]
  onSelectRevenue: (revenue: TimelineItem) => void
  onSelectVariableCost: (cost: TimelineItem) => void
  onSelectOverheadCost: (cost: TimelineItem) => void
}

export function TimelineMonth({
  month,
  revenues,
  variableCosts,
  overheadCosts,
  onSelectRevenue,
  onSelectVariableCost,
  onSelectOverheadCost,
}: TimelineMonthProps) {
  const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalVariableCosts = variableCosts.reduce((sum, c) => sum + Number(c.amount), 0)
  const totalOverheadCosts = overheadCosts.reduce((sum, c) => sum + Number(c.amount), 0)
  const profit = totalRevenue - totalVariableCosts - totalOverheadCosts

  return (
    <div className="bg-white p-2 min-h-[250px] flex flex-col">
      <div className="flex items-center justify-between gap-1 mb-2">
        <h3 className="text-sm font-medium">{format(month, "MMM yyyy")}</h3>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Revenues section */}
        <div className="space-y-2 flex-1">
          {revenues.map((revenue) => (
            <div
              key={revenue.id}
              onClick={() => onSelectRevenue(revenue)}
              className="p-1.5 bg-green-50 border border-green-200 rounded text-sm cursor-pointer hover:bg-green-100"
            >
              ${revenue.amount.toFixed(2)}
            </div>
          ))}
        </div>

        {/* Separator line */}
        <div className="border-t border-gray-200 my-2" />

        {/* Costs section */}
        <div className="space-y-2 flex-1">
          {variableCosts.map((cost) => (
            <div
              key={cost.id}
              onClick={() => onSelectVariableCost(cost)}
              className="p-1.5 bg-red-50 border border-red-200 rounded text-sm cursor-pointer hover:bg-red-100"
            >
              <div>-${cost.amount.toFixed(2)}</div>
              {cost.description && (
                <div className="text-xs text-gray-600">{cost.description}</div>
              )}
            </div>
          ))}

          {overheadCosts.map((cost) => (
            <div
              key={cost.id}
              onClick={() => onSelectOverheadCost(cost)}
              className="p-1.5 bg-orange-50 border border-orange-200 rounded text-sm cursor-pointer hover:bg-orange-100"
            >
              -${cost.amount.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-2 text-sm font-medium ${
        profit >= 0 
          ? "text-green-600"
          : "text-red-600"
      }`}>
        ${profit.toFixed(2)}
      </div>
    </div>
  )
}
