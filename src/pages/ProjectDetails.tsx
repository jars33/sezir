
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ProjectDialog } from "@/components/ProjectDialog"
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog"
import { ProjectTimelineView } from "@/components/projects/ProjectTimelineView"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ProjectFormSchema } from "@/components/projects/project-schema"
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
  team_id: string | null
}

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { session } = useAuth()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: project, isLoading: isLoadingProject } = useQuery({
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

  // Check if the current user is the creator, or a manager/member of the project's team
  const { data: hasPermission = false, isLoading: isLoadingPermission } = useQuery({
    queryKey: ["project-permission", id, session?.user.id, project?.team_id],
    enabled: !!session?.user.id && !!project,
    queryFn: async () => {
      // If project has no team_id, check if user is the creator
      if (!project?.team_id) {
        return project.user_id === session?.user.id
      }
      
      // Check if user is a team manager of the project's team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("manager_id")
        .eq("id", project.team_id)
        .single()

      if (teamError) {
        console.error("Error checking team manager:", teamError)
        return false
      }

      // Check if user is the team manager
      if (teamData?.manager_id === session?.user.id) {
        return true
      }

      // Check if user is a member of the team
      const { data: membershipData, error: membershipError } = await supabase
        .from("team_memberships")
        .select("id")
        .eq("team_id", project.team_id)
        .eq("team_member_id", session?.user.id)
        .single()

      if (membershipError && membershipError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which just means user is not a member
        console.error("Error checking team membership:", membershipError)
      }

      // User has permission if they're a member of the team
      return !!membershipData
    }
  })

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
      if (!hasPermission) {
        toast.error("You don't have permission to delete this project")
        return
      }

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

  if (isLoadingProject || isLoadingPermission) {
    return <div className="p-4">Loading...</div>
  }

  if (!project) {
    return <div className="p-4">Project not found</div>
  }

  return (
    <div className="p-4">
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
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate max-w-[500px] mx-auto">
            {project.number} - {project.name}
          </h1>
          <p className="text-sm text-gray-500">
            Status: {project.status.replace("_", " ")}
          </p>
        </div>
        <div className="flex space-x-2 self-end md:col-start-3 md:justify-end md:self-center">
          {hasPermission ? (
            <>
              <Button onClick={() => setEditDialogOpen(true)}>Edit Project</Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Project
              </Button>
            </>
          ) : (
            <div className="text-sm text-amber-500">
              You don't have permission to edit this project
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 mt-6">
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
  )
}
