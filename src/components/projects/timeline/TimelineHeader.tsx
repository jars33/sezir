
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface TimelineHeaderProps {
  onAddRevenue: () => void
  onAddVariableCost: () => void
  onAddAllocation?: () => void
  onPreviousYear: () => void
  onNextYear: () => void
  totalProfit: number
  startDate: Date
}

export function TimelineHeader({
  onAddRevenue,
  onAddVariableCost,
  onAddAllocation,
  onPreviousYear,
  onNextYear,
  totalProfit,
  startDate,
}: TimelineHeaderProps) {
  const [showDecimals] = useLocalStorage<boolean>("showDecimals", true)

  const formatAmount = (amount: number) => {
    return showDecimals ? amount.toFixed(2) : Math.round(amount).toString()
  }

  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <CardTitle>Financials</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Total Profit:
            </span>
            <div className={`text-lg font-semibold min-w-[150px] ${
              totalProfit >= 0 
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {totalProfit < 0 ? '-' : ''}€{Math.abs(totalProfit).toLocaleString('en-US', { 
                minimumFractionDigits: showDecimals ? 2 : 0, 
                maximumFractionDigits: showDecimals ? 2 : 0 
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-green-50 hover:text-green-600"
              onClick={onAddRevenue}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Revenue
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-red-50 hover:text-red-600"
              onClick={onAddVariableCost}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Cost
            </Button>
            {onAddAllocation && (
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-600"
                onClick={onAddAllocation}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Allocation
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onPreviousYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-2 py-1 font-medium">
              {format(startDate, "yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={onNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  )
}
