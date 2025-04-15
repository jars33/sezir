
import { useState, useCallback, useMemo } from "react"
import { setMonth, startOfMonth, format } from "date-fns"
import { useProjectYear } from "@/hooks/use-project-year"
import type { TimelineItem, AllocationItem } from "./actions/types"

export function useTimelineState() {
  const { year, setYear } = useProjectYear()
  
  // Calculate start date based on the current year
  const [startDate, setStartDate] = useState(() => {
    return startOfMonth(setMonth(new Date(year, 0), 0))
  })

  // Dialog state and selected items
  const [addRevenueDate, setAddRevenueDate] = useState<Date | null>(null)
  const [addVariableCostDate, setAddVariableCostDate] = useState<Date | null>(null)
  const [selectedRevenue, setSelectedRevenue] = useState<TimelineItem | null>(null)
  const [selectedVariableCost, setSelectedVariableCost] = useState<TimelineItem | null>(null)
  const [deleteRevenue, setDeleteRevenue] = useState<TimelineItem | null>(null)
  const [deleteVariableCost, setDeleteVariableCost] = useState<TimelineItem | null>(null)
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationItem | null>(null)
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false)

  // Year navigation handlers
  const handlePreviousYear = () => {
    const newYear = year - 1
    setYear(newYear)
    setStartDate(startOfMonth(setMonth(new Date(newYear, 0), 0)))
  }

  const handleNextYear = () => {
    const newYear = year + 1
    setYear(newYear)
    setStartDate(startOfMonth(setMonth(new Date(newYear, 0), 0)))
  }

  // Event handlers for timeline interactions
  const handleRevenueSeleсtion = (revenue: TimelineItem) => {
    if (revenue.isNew === true) {
      // Set the exact month when adding a new revenue
      setAddRevenueDate(new Date(revenue.month))
    } else {
      setSelectedRevenue(revenue)
    }
  }

  const handleAllocationSelection = (allocation: AllocationItem) => {
    setSelectedAllocation(allocation)
    setAllocationDialogOpen(true)
  }

  const handleAddAllocation = () => {
    setSelectedAllocation(null)
    setAllocationDialogOpen(true)
  }

  return {
    // Current state 
    year,
    startDate,
    addRevenueDate,
    addVariableCostDate,
    selectedRevenue,
    selectedVariableCost,
    deleteRevenue,
    deleteVariableCost,
    selectedAllocation,
    allocationDialogOpen,
    
    // State setters
    setAddRevenueDate,
    setAddVariableCostDate,
    setSelectedRevenue,
    setSelectedVariableCost,
    setDeleteRevenue,
    setDeleteVariableCost,
    setSelectedAllocation,
    setAllocationDialogOpen,
    
    // Event handlers
    handlePreviousYear,
    handleNextYear,
    handleRevenueSeleсtion,
    handleAllocationSelection,
    handleAddAllocation
  }
}
