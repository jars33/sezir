
import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { projectAllocationsService } from "@/services/supabase/project-allocations-service";
import { AllocationData } from "./types";

export function useAllocations(projectId: string) {
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleAllocationClick = (allocation: AllocationData) => {
    setSelectedAllocation(allocation);
    setDialogOpen(true);
  };

  const handleAddAllocation = async (values: {
    teamMemberId: string;
    month: Date;
    allocation: string;
  }) => {
    try {
      const existingAssignment = await projectAllocationsService.getExistingAssignment(
        projectId,
        values.teamMemberId
      );

      let assignmentId: string;

      if (!existingAssignment) {
        const newAssignment = await projectAllocationsService.createAssignment(
          projectId,
          values.teamMemberId,
          values.month
        );
        
        assignmentId = newAssignment.id;
      } else {
        assignmentId = existingAssignment.id;
      }

      const monthStr = format(startOfMonth(values.month), "yyyy-MM-dd");

      const existingAllocation = await projectAllocationsService.checkExistingAllocation(
        assignmentId, 
        monthStr
      );

      if (existingAllocation) {
        await projectAllocationsService.updateAllocation(
          existingAllocation.id,
          parseInt(values.allocation)
        );

        toast({
          title: t('common.success'),
          description: "Team member allocation updated successfully",
        });
      } else {
        await projectAllocationsService.createAllocation(
          assignmentId,
          monthStr,
          parseInt(values.allocation)
        );

        toast({
          title: t('common.success'),
          description: "Team member allocation added successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["project-allocations"] });
      setDialogOpen(false);
      setSelectedAllocation(null);
    } catch (error: any) {
      console.error("Error managing allocation:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.message,
      });
    }
  };

  return {
    selectedAllocation,
    dialogOpen,
    setDialogOpen,
    handleAllocationClick,
    handleAddAllocation
  };
}
