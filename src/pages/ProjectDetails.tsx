
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectDialog } from "@/components/ProjectDialog";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { ProjectTimelineView } from "@/components/projects/ProjectTimelineView";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { useAuth } from "@/components/AuthProvider";
import { useProjectManagement } from "@/hooks/use-project-management";
import { projectService } from "@/services/supabase";
import { useProjectPermissions } from "@/components/projects/timeline/hooks/useProjectPermissions";
import { useTranslation } from "react-i18next";

export default function ProjectDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { session } = useAuth();
  const projectId = id || "";

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      try {
        const data = await projectService.getProjectById(projectId);
        if (!data) {
          toast.error("Project not found");
          throw new Error("Project not found");
        }
        return data;
      } catch (error) {
        toast.error("Failed to load project");
        throw error;
      }
    },
  });

  // Check user permissions for the project
  const { data: hasPermission = false, isLoading: isLoadingPermission } = useProjectPermissions(
    projectId,
    project?.user_id,
    project?.team_id
  );

  // Project management hooks
  const {
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleEditProject,
    handleDeleteProject
  } = useProjectManagement(projectId, hasPermission);

  if (isLoadingProject || isLoadingPermission) {
    return <div className="p-4">{t('common.loading')}</div>;
  }

  if (!project) {
    return <div className="p-4">Project not found</div>;
  }

  return (
    <div className="p-4">
      <ProjectHeader
        projectNumber={project.number}
        projectName={project.name}
        projectStatus={project.status || "planned"} 
        hasPermission={hasPermission}
        onEditClick={() => setEditDialogOpen(true)}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />

      <div className="mt-6">
        <ProjectTimelineView projectId={project.id} />
      </div>

      <ProjectDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditProject}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
