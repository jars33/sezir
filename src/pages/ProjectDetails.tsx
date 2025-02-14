
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ProjectDialog } from "@/components/ProjectDialog"
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog"
import { ProjectTimelineView } from "@/components/projects/ProjectTimelineView"
import { ProjectAllocations } from "@/components/projects/allocations/ProjectAllocations"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ProjectFormSchema } from "@/components/projects/project-schema"

type Project = {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        toast.error("Failed to load project")
        throw error
      }

      return data as Project
    },
  })

  const handleEditProject = async (values: ProjectFormSchema) => {
    try {
      const projectData = {
        number: values.number,
        name: values.name,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
      }

      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", id)

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
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)

      if (error) throw error

      navigate("/projects")
      toast.success("Project deleted successfully")
    } catch (error) {
      toast.error("Failed to delete project")
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!project) {
    return <div className="p-6">Project not found</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="self-start md:col-start-1 w-24"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="w-full text-center md:col-start-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate max-w-[500px] mx-auto">
            {project.number} - {project.name}
          </h1>
          <p className="text-sm text-gray-500">
            Status: {project.status.replace("_", " ")}
          </p>
        </div>
        <div className="flex space-x-2 self-end md:col-start-3 md:justify-end md:self-center">
          <Button onClick={() => setEditDialogOpen(true)}>Edit Project</Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Project
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <ProjectTimelineView projectId={project.id} />
        <ProjectAllocations projectId={project.id} />
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
  )
}
