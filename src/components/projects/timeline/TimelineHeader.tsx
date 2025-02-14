
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface TimelineHeaderProps {
  onAddRevenue: () => void
  onAddVariableCost: () => void
  onAddOverheadCost: () => void
  onPreviousYear: () => void
  onNextYear: () => void
  totalProfit: number
  startDate: Date
}

export function TimelineHeader({
  onAddRevenue,
  onAddVariableCost,
  onAddOverheadCost,
  onPreviousYear,
  onNextYear,
  totalProfit,
  startDate,
}: TimelineHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <CardTitle>Project Timeline</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Total for {format(startDate, "yyyy")}:
            </span>
            <div className={`text-lg font-semibold ${
              totalProfit >= 0 
                ? "text-green-600"
                : "text-red-600"
            }`}>
              €{Math.abs(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {totalProfit < 0 && ' loss'}
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
              Variable Cost
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-orange-50 hover:text-orange-600"
              onClick={onAddOverheadCost}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Overhead Cost
            </Button>
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
