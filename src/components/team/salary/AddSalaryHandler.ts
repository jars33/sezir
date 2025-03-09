
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
          end_date: values.end_date,
        })

      if (error) throw error

      await refetchSalaryHistory()

      toast({
        title: "Success",
        description: "Salary history updated successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  return { handleAddSalary }
}
