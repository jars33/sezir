
import { teamMemberAllocationsService } from "@/services/supabase"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AllocationData } from "./types"

interface AllocationValues {
  projectId: string
  month: Date
  allocation: string
}

export function useAllocationSubmit(
  memberId: string, 
  onSuccess: (options?: RefetchOptions) => Promise<QueryObserverResult<AllocationData[], Error>>
) {
  const handleAllocationSubmit = async (values: AllocationValues): Promise<void> => {
    try {
      // Create or get the assignment ID
      const assignmentId = await teamMemberAllocationsService.createAssignment(
        memberId,
        values.projectId,
        values.month
      );

      // Create the allocation
      await teamMemberAllocationsService.createAllocation(
        assignmentId,
        values.month,
        parseInt(values.allocation)
      );

      await onSuccess();
      // Removed the return true statement as it causes the type mismatch
    } catch (error: any) {
      console.error("Error submitting allocation:", error)
      
      // Provide more specific error messages based on the error
      if (error.message?.includes("row-level security policy")) {
        toast.error("Permission error: You don't have access to create this allocation.");
      } else {
        toast.error("Failed to add allocation. Please try again.");
      }
      
      throw error;
    }
  }

  return { handleAllocationSubmit }
}
