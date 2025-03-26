
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { SalaryHistory } from "@/types/team-member"

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
      const { error } = await supabase
        .from("salary_history")
        .insert({
          team_member_id: id,
          amount: parseFloat(values.amount),
          start_date: values.start_date,
          end_date: values.end_date || null,
        })

      if (error) throw error

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
      const { error } = await supabase
        .from("salary_history")
        .update({
          amount: parseFloat(values.amount),
          start_date: values.start_date,
          end_date: values.end_date || null,
        })
        .eq("id", salaryId)

      if (error) throw error

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
      const { error } = await supabase
        .from("salary_history")
        .delete()
        .eq("id", salaryId)

      if (error) throw error

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

  // New function to update the end date of previous salary
  const updatePreviousSalaryEndDate = async (salaryId: string, endDate: string) => {
    try {
      const { error } = await supabase
        .from("salary_history")
        .update({
          end_date: endDate,
        })
        .eq("id", salaryId)

      if (error) throw error

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
