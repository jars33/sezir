
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface ProjectRevenue {
  id: string
  month: string
  amount: number
  project_id: string
  created_at: string
  updated_at: string
}

export function useProjectRevenues(projectId: string) {
  const queryClient = useQueryClient()

  const { data: revenues, isLoading } = useQuery({
    queryKey: ["project-revenues", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_revenues")
        .select("*")
        .eq("project_id", projectId)
        .order("month", { ascending: false })

      if (error) {
        toast.error("Failed to load revenues")
        throw error
      }

      return data as ProjectRevenue[]
    },
  })

  const createRevenueMutation = useMutation({
    mutationFn: async (values: { month: string; amount: string }) => {
      // First check if there's an existing revenue for this month
      const { data: existingRevenue, error: checkError } = await supabase
        .from("project_revenues")
        .select("*")
        .eq("project_id", projectId)
        .eq("month", values.month + "-01")
        .maybeSingle()

      if (checkError) throw checkError

      if (existingRevenue) {
        // If there's an existing revenue, update it by adding the new amount
        const newAmount = parseFloat(existingRevenue.amount.toString()) + parseFloat(values.amount)
        const { error } = await supabase
          .from("project_revenues")
          .update({ amount: newAmount })
          .eq("id", existingRevenue.id)

        if (error) throw error
      } else {
        // If there's no existing revenue, create a new one
        const { error } = await supabase
          .from("project_revenues")
          .insert([{
            project_id: projectId,
            month: values.month + "-01",
            amount: parseFloat(values.amount),
          }])

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue added successfully")
    },
    onError: () => {
      toast.error("Failed to add revenue")
    },
  })

  const updateRevenueMutation = useMutation({
    mutationFn: async (values: { id: string; month: string; amount: string }) => {
      const { error } = await supabase
        .from("project_revenues")
        .update({
          month: values.month + "-01",
          amount: parseFloat(values.amount),
        })
        .eq("id", values.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue updated successfully")
    },
    onError: () => {
      toast.error("Failed to update revenue")
    },
  })

  const deleteRevenueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_revenues")
        .delete()
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-revenues"] })
      toast.success("Revenue deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete revenue")
    },
  })

  return {
    revenues,
    isLoading,
    createRevenueMutation,
    updateRevenueMutation,
    deleteRevenueMutation,
  }
}
