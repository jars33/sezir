
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ProjectDialog } from "@/components/ProjectDialog"
import { type ProjectFormSchema } from "@/components/projects/project-schema"
import { ProjectList } from "@/components/projects/ProjectList"
import { ProjectTimelineView } from "@/components/projects/ProjectTimelineView"
import { useAuth } from "@/components/AuthProvider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const navigate = useNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

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

  const handleCreateProject = async (values: ProjectFormSchema) => {
    try {
      const projectData = {
        number: values.number,
        name: values.name,
        user_id: session?.user.id,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single()

      if (error) throw error

      setCreateDialogOpen(false)
      toast.success("Project created successfully")
      
      if (data) {
        navigate(`/projects/${data.id}`)
      }
    } catch (error) {
      toast.error("Failed to create project")
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

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ProjectList
            projects={projects ?? []}
            onEdit={(project) => navigate(`/projects/${project.id}`)}
            onDelete={(project) => navigate(`/projects/${project.id}`)}
            onSelect={(project) => {
              setSelectedProject(project)
              navigate(`/projects/${project.id}`)
            }}
            selectedProject={selectedProject}
          />
        </TabsContent>

        <TabsContent value="timeline">
          {selectedProject ? (
            <ProjectTimelineView projectId={selectedProject.id} />
          ) : (
            <div className="text-center p-6 text-gray-500">
              Select a project to view its timeline
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}
