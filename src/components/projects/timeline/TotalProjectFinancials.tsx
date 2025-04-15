
import { useMemo } from "react"
import { getYear } from "date-fns"
import { useProjectSettings } from "@/hooks/use-project-settings"
import { TimelineItem, AllocationItem } from "@/utils/financial-calculations"

interface TotalProjectFinancialsProps {
  allProjectRevenues: TimelineItem[]
  allProjectVariableCosts: TimelineItem[]
  allProjectAllocations: AllocationItem[]
}

export function TotalProjectFinancials({
  allProjectRevenues,
  allProjectVariableCosts,
  allProjectAllocations
}: TotalProjectFinancialsProps) {
  const { getOverheadPercentage } = useProjectSettings()
  
  // Calculate total project profit across all years, including overhead
  const { totalProjectProfit, totalProjectRevenues } = useMemo(() => {
    // Calculate total revenues across all years
    const totalRevs = allProjectRevenues?.reduce((sum, r) => sum + Number(r.amount), 0) || 0
    
    // Calculate total variable costs across all years
    const totalVarCosts = allProjectVariableCosts?.reduce((sum, c) => sum + Number(c.amount), 0) || 0
    
    // Calculate total salary costs across all years
    const totalSalaryCosts = allProjectAllocations?.reduce((sum, a) => sum + Number(a.salary_cost), 0) || 0
    
    // Group costs by year for proper overhead calculation
    const costsByYear = new Map<number, { varCosts: number, salaryCosts: number }>()
    
    // Group variable costs by year
    allProjectVariableCosts?.forEach(cost => {
      const costYear = getYear(new Date(cost.month))
      if (!costsByYear.has(costYear)) {
        costsByYear.set(costYear, { varCosts: 0, salaryCosts: 0 })
      }
      const yearData = costsByYear.get(costYear)!
      yearData.varCosts += Number(cost.amount)
      costsByYear.set(costYear, yearData)
    })
    
    // Group salary costs by year
    allProjectAllocations?.forEach(allocation => {
      const allocYear = getYear(new Date(allocation.month))
      if (!costsByYear.has(allocYear)) {
        costsByYear.set(allocYear, { varCosts: 0, salaryCosts: 0 })
      }
      const yearData = costsByYear.get(allocYear)!
      yearData.salaryCosts += Number(allocation.salary_cost)
      costsByYear.set(allocYear, yearData)
    })
    
    // Calculate overhead costs for each year based on that year's costs (variable + salary)
    let totalOverheadCosts = 0
    costsByYear.forEach((costs, yearNum) => {
      const yearOverheadPercentage = getOverheadPercentage(yearNum)
      const yearTotalCosts = costs.varCosts + costs.salaryCosts
      totalOverheadCosts += (yearTotalCosts * yearOverheadPercentage) / 100
    })
    
    // Calculate total profit with overhead included
    const totalProfit = totalRevs - totalVarCosts - totalSalaryCosts - totalOverheadCosts
    
    return {
      totalProjectProfit: totalProfit,
      totalProjectRevenues: totalRevs
    }
  }, [allProjectRevenues, allProjectVariableCosts, allProjectAllocations, getOverheadPercentage])

  return { totalProjectProfit, totalProjectRevenues }
}
