
import { useToast } from "@/hooks/use-toast"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { SalaryHistory } from "@/types/team-member"
import { salaryHandlingService } from "@/services/supabase"

export function useAddSalary(
  refetchSalaryHistory: (options?: RefetchOptions) => Promise<QueryObserverResult<SalaryHistory[], Error>>
) {
  const { toast } = useToast()

  const handleAddSalary = async (
    id: string | undefined, 
    values: { amount: string, start_date: string, end_date: string },
    isNewMember: boolean,
    userId?: string
  ) => {
    if (!id || isNewMember || !userId) return;

    try {
      await salaryHandlingService.addSalary(
        id,
        parseFloat(values.amount),
        values.start_date,
        values.end_date || null
      );

      await refetchSalaryHistory()

      toast({
        title: "Success",
        description: "Salary history added successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handleEditSalary = async (
    salaryId: string,
    values: { amount: string, start_date: string, end_date: string }
  ) => {
    try {
      await salaryHandlingService.updateSalary(
        salaryId,
        parseFloat(values.amount),
        values.start_date,
        values.end_date || null
      );

      await refetchSalaryHistory()

      toast({
        title: "Success",
        description: "Salary updated successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handleDeleteSalary = async (salaryId: string) => {
    try {
      await salaryHandlingService.deleteSalary(salaryId);

      await refetchSalaryHistory()

      toast({
        title: "Success",
        description: "Salary deleted successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  // Update the end date of previous salary
  const updatePreviousSalaryEndDate = async (salaryId: string, endDate: string) => {
    try {
      await salaryHandlingService.updateSalaryEndDate(salaryId, endDate);
      
      // Don't refetch or show toast here as this is part of add salary flow
    } catch (error: any) {
      console.error("Error updating previous salary end date:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update previous salary: " + error.message,
      })
      throw error
    }
  }

  return { handleAddSalary, handleEditSalary, handleDeleteSalary, updatePreviousSalaryEndDate }
}
