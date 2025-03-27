
import { useCallback } from "react"
import { 
  isWithinInterval, 
  isBefore, 
  isAfter, 
  addMonths, 
  differenceInCalendarMonths 
} from "date-fns"

interface Project {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

export function useGanttCalculations(year: number) {
  // Create date objects for the start and end of the selected year
  const yearStart = new Date(year, 0, 1) // January 1st
  const yearEnd = new Date(year, 11, 31) // December 31st

  // Get status color based on project status
  const getStatusColor = useCallback((status: Project["status"]) => {
    switch (status) {
      case "planned":
        return "bg-yellow-500"
      case "in_progress":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }, [])

  // Calculate the position and width of a project bar
  const calculateProjectBar = useCallback((project: Project) => {
    if (!project.start_date) return { offset: 0, width: 0 }
    
    const projectStart = new Date(project.start_date)
    const projectEnd = project.end_date ? new Date(project.end_date) : addMonths(projectStart, 1)
    
    // Calculate how many months from the start of the year
    const startOffset = Math.max(
      0, 
      differenceInCalendarMonths(
        isBefore(projectStart, yearStart) ? yearStart : projectStart, 
        yearStart
      )
    )
    
    // Calculate project duration in months (capped at end of year)
    const endDate = isAfter(projectEnd, yearEnd) ? yearEnd : projectEnd
    const duration = Math.max(
      1, 
      differenceInCalendarMonths(endDate, isBefore(projectStart, yearStart) ? yearStart : projectStart) + 1
    )

    return {
      offset: startOffset / 12 * 100, // as percentage of year
      width: duration / 12 * 100      // as percentage of year
    }
  }, [yearStart, yearEnd])

  // Filter projects based on date range
  const filterProjectsByDateRange = useCallback((projects: Project[]) => {
    return projects.filter(project => {
      // Filter by date range (must fall within or overlap with selected year)
      if (!project.start_date) return false;
      
      const projectStart = new Date(project.start_date);
      const projectEnd = project.end_date ? new Date(project.end_date) : null;
      
      return (
        // Either starts in this year
        isWithinInterval(projectStart, { start: yearStart, end: yearEnd }) ||
        // Or started earlier but ends in or after this year
        (isBefore(projectStart, yearStart) && (!projectEnd || isAfter(projectEnd, yearStart)))
      );
    });
  }, [yearStart, yearEnd])

  // Calculate current date position as percentage of year
  const calculateCurrentDatePosition = useCallback(() => {
    const currentDate = new Date()
    
    // If current date is not in the selected year, don't show the line
    if (currentDate.getFullYear() !== year) return null;
    
    // Calculate days passed in the year as percentage of total days in year
    const startOfYear = new Date(year, 0, 1);
    const daysInYear = 365 + (year % 4 === 0 ? 1 : 0); // Account for leap years
    const daysPassed = differenceInCalendarMonths(currentDate, startOfYear) * 30 + 
                      currentDate.getDate() - 1;
    
    return (daysPassed / daysInYear) * 100;
  }, [year])

  return {
    getStatusColor,
    calculateProjectBar,
    filterProjectsByDateRange,
    calculateCurrentDatePosition
  }
}
