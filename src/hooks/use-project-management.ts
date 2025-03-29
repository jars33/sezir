
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { projectService } from "@/services/supabase";
import type { ProjectFormSchema } from "@/components/projects/project-schema";

export function useProjectManagement(projectId: string, hasPermission: boolean) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditProject = async (values: ProjectFormSchema) => {
    try {
      if (!hasPermission) {
        toast.error("You don't have permission to edit this project");
        return;
      }

      const projectData = {
        number: values.number,
        name: values.name,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
        team_id: values.team_id === "no-team" ? null : values.team_id,
      };

      await projectService.updateProject(projectId, projectData);
      setEditDialogOpen(false);
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (!hasPermission) {
        toast.error("You don't have permission to delete this project");
        return;
      }

      await projectService.deleteProject(projectId);
      navigate("/projects");
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    }
  };

  return {
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleEditProject,
    handleDeleteProject
  };
}
