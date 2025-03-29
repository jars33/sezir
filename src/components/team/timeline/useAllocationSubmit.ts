
import { teamMemberAllocationsService } from "@/services/supabase"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
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
  const handleAllocationSubmit = async (values: AllocationValues) => {
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
    } catch (error: any) {
      console.error("Error submitting allocation:", error)
      throw error;
    }
  }

  return { handleAllocationSubmit }
}
