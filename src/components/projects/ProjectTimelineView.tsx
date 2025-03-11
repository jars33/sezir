
import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectDialog } from "@/components/ProjectDialog"
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog"
import { TimelineView } from "./timeline/TimelineView"
import { useProjectDetails, type Project } from "./timeline/hooks/useProjectDetails"
import { useProjectPermissions } from "./timeline/hooks/useProjectPermissions"
import type { ProjectFormSchema } from "@/components/projects/project-schema"

interface ProjectTimelineViewProps {
  projectId: string
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: project, isLoading: isLoadingProject } = useProjectDetails(projectId)
  const { data: hasPermission = false, isLoading: isLoadingPermission } = useProjectPermissions(
    projectId,
    project?.user_id,
    project?.team_id
  )

  const handleEditProject = async (values: ProjectFormSchema) => {
    try {
      if (!hasPermission) {
        toast.error("You don't have permission to edit this project")
        return
      }

      const projectData = {
        number: values.number,
        name: values.name,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
        team_id: values.team_id === "no-team" ? null : values.team_id,
      }

      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", projectId)

      if (error) throw error

      setEditDialogOpen(false)
      toast.success("Project updated successfully")
    } catch (error) {
      toast.error("Failed to update project")
      console.error(error)
    }
  }

  const handleDeleteProject = async () => {
    try {
      if (!hasPermission) {
        toast.error("You don't have permission to delete this project")
        return
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

      if (error) throw error

      toast.success("Project deleted successfully")
      // We don't need to navigate here as the parent will handle it
    } catch (error) {
      toast.error("Failed to delete project")
      console.error(error)
    }
  }

  if (isLoadingProject || isLoadingPermission) {
    return <div className="p-4">Loading...</div>
  }

  if (!project) {
    return <div className="p-4">Project not found</div>
  }

  return (
    <div className="space-y-6">
      <TimelineView projectId={projectId} />

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
  )
}
