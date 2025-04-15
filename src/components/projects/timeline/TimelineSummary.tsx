
import { format, getYear, getQuarter, startOfYear, endOfYear } from "date-fns"
import { Card } from "@/components/ui/card"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatCurrency } from "@/lib/utils"

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
}

interface TimelineSummaryProps {
  year: number
  revenues: TimelineItem[]
  variableCosts: TimelineItem[]
  allocations: AllocationItem[]
}

export function TimelineSummary({
  year,
  revenues,
  variableCosts,
  allocations,
}: TimelineSummaryProps) {
  const { getOverheadPercentage } = useProjectSettings()
  // Use useLocalStorage hook directly for consistency
  const [showDecimals] = useLocalStorage<boolean>("showDecimals", true)
  
  const calculateProfit = (items: any[], startDate: Date, endDate: Date) => {
    const filteredRevenues = revenues.filter(
      r => {
        const date = new Date(r.month)
        return date >= startDate && date <= endDate
      }
    ).reduce((sum, r) => sum + Number(r.amount), 0)

    const filteredVariableCosts = variableCosts.filter(
      c => {
        const date = new Date(c.month)
        return date >= startDate && date <= endDate
      }
    ).reduce((sum, c) => sum + Number(c.amount), 0)
    
    const filteredSalaryCosts = allocations.filter(
      a => {
        const date = new Date(a.month)
        return date >= startDate && date <= endDate
      }
    ).reduce((sum, a) => sum + Number(a.salary_cost), 0)
    
    const overheadPercentage = getOverheadPercentage(year)
    
    // Calculate overhead costs based on variable costs AND salary costs
    const filteredOverheadCosts = ((filteredVariableCosts + filteredSalaryCosts) * overheadPercentage) / 100

    const totalCosts = filteredVariableCosts + filteredOverheadCosts + filteredSalaryCosts

    const profit = filteredRevenues - totalCosts
    const rentability = totalCosts > 0 ? (profit / totalCosts) * 100 : 0

    return {
      profit,
      rentability
    }
  }

  const formatRentability = (rentability: number) => {
    return `${rentability.toFixed(2).replace(/\.?0+$/, '')}%`
  }

  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))

  const quarters = [
    { label: "Q1", start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
    { label: "Q2", start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
    { label: "Q3", start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
    { label: "Q4", start: new Date(year, 9, 1), end: new Date(year, 11, 31) },
  ]

  const semesters = [
    { label: "S1", start: new Date(year, 0, 1), end: new Date(year, 5, 30) },
    { label: "S2", start: new Date(year, 6, 1), end: new Date(year, 11, 31) },
  ]

  const yearResult = calculateProfit(revenues, yearStart, yearEnd)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {quarters.map((quarter) => {
            const result = calculateProfit(revenues, quarter.start, quarter.end)
            return (
              <Card key={quarter.label} className="p-3">
                <div className="text-sm font-medium text-muted-foreground">{quarter.label}</div>
                <div className={`text-lg font-semibold ${
                  result.profit >= 0 
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {formatCurrency(result.profit, showDecimals)}
                </div>
                <div className={`text-sm ${
                  result.rentability >= 0 
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {formatRentability(result.rentability)}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {semesters.map((semester) => {
            const result = calculateProfit(revenues, semester.start, semester.end)
            return (
              <Card key={semester.label} className="p-3">
                <div className="text-sm font-medium text-muted-foreground">{semester.label}</div>
                <div className={`text-lg font-semibold ${
                  result.profit >= 0 
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {formatCurrency(result.profit, showDecimals)}
                </div>
                <div className={`text-sm ${
                  result.rentability >= 0 
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {formatRentability(result.rentability)}
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="p-3 mt-2">
          <div className="text-sm font-medium text-muted-foreground">{year}</div>
          <div className={`text-lg font-semibold ${
            yearResult.profit >= 0 
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            {formatCurrency(yearResult.profit, showDecimals)}
          </div>
          <div className={`text-sm ${
            yearResult.rentability >= 0 
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            {formatRentability(yearResult.rentability)}
          </div>
        </Card>
      </div>
    </div>
  )
}
