
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { revenueService } from "@/services/supabase"

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
      try {
        const data = await revenueService.getProjectRevenues(projectId)
        return data as ProjectRevenue[]
      } catch (error) {
        toast.error("Failed to load revenues")
        throw error
      }
    },
  })

  const createRevenueMutation = useMutation({
    mutationFn: async (values: { month: string; amount: string }) => {
      const formattedMonth = values.month + "-01";
      
      try {
        await revenueService.createRevenue(
          projectId, 
          formattedMonth, 
          parseFloat(values.amount)
        );
      } catch (error) {
        throw error;
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
      const formattedMonth = values.month + "-01";
      
      try {
        await revenueService.updateRevenue(
          values.id, 
          formattedMonth, 
          parseFloat(values.amount)
        );
      } catch (error) {
        throw error;
      }
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
      try {
        await revenueService.deleteRevenue(id);
      } catch (error) {
        throw error;
      }
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
