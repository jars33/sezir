
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ProjectDialog, ProjectFormValues } from "@/components/ProjectDialog"
import { ProjectList } from "@/components/projects/ProjectList"
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog"
import { useAuth } from "@/components/AuthProvider"

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

export default function Projects() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to load projects")
        throw error
      }

      return data as Project[]
    },
  })

  const handleCreateProject = async (values: ProjectFormValues) => {
    try {
      const projectData = {
        number: values.number,
        name: values.name,
        user_id: session?.user.id,
        start_date: values.start_date?.toISOString().split('T')[0] || null,
        end_date: values.end_date?.toISOString().split('T')[0] || null,
        status: values.status,
      }

      const { error } = await supabase
        .from("projects")
        .insert([projectData])

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      setCreateDialogOpen(false)
      toast.success("Project created successfully")
    } catch (error) {
      toast.error("Failed to create project")
      console.error(error)
    }
  }

  const handleEditProject = async (values: ProjectFormValues) => {
    if (!editProject) return

    try {
      const projectData = {
        number: values.number,
        name: values.name,
        start_date: values.start_date?.toISOString().split('T')[0] || null,
        end_date: values.end_date?.toISOString().split('T')[0] || null,
        status: values.status,
      }

      const { error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editProject.id)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      setEditProject(null)
      toast.success("Project updated successfully")
    } catch (error) {
      toast.error("Failed to update project")
      console.error(error)
    }
  }

  const handleDeleteProject = async () => {
    if (!deleteProject) return

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deleteProject.id)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      setDeleteProject(null)
      toast.success("Project deleted successfully")
    } catch (error) {
      toast.error("Failed to delete project")
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <ProjectList
        projects={projects ?? []}
        onEdit={setEditProject}
        onDelete={setDeleteProject}
      />

      <ProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateProject}
      />

      <ProjectDialog
        project={editProject ?? undefined}
        open={Boolean(editProject)}
        onOpenChange={(open) => !open && setEditProject(null)}
        onSubmit={handleEditProject}
      />

      <DeleteProjectDialog
        open={Boolean(deleteProject)}
        onOpenChange={(open) => !open && setDeleteProject(null)}
        onConfirm={handleDeleteProject}
      />
    </div>
  )
}
