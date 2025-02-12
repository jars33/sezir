
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ProjectRevenueList } from "@/components/projects/revenues/ProjectRevenueList"
import { ProjectCostsList } from "@/components/projects/costs/ProjectCostsList"
import { ProjectDialog } from "@/components/ProjectDialog"
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog"
import { useState } from "react"
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.number} - {project.name}
            </h1>
            <p className="text-sm text-gray-500">
              Status: {project.status.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setEditDialogOpen(true)}>Edit Project</Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Project
          </Button>
        </div>
      </div>

      <ProjectRevenueList projectId={project.id} />
      <ProjectCostsList projectId={project.id} />

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
