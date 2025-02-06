
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit2Icon, PlusCircle, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProjectDialog } from "@/components/ProjectDialog"
import { useAuth } from "@/components/AuthProvider"

type Project = {
  id: string
  number: string
  name: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
}

const statusColors = {
  planned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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

  const handleCreateProject = async (values: Omit<Project, "id">) => {
    try {
      const { error } = await supabase.from("projects").insert([
        {
          ...values,
          user_id: session?.user.id,
        },
      ])

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      setCreateDialogOpen(false)
      toast.success("Project created successfully")
    } catch (error) {
      toast.error("Failed to create project")
      console.error(error)
    }
  }

  const handleEditProject = async (values: Omit<Project, "id">) => {
    if (!editProject) return

    try {
      const { error } = await supabase
        .from("projects")
        .update(values)
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.number}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[project.status]}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditProject(project)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteProject(project)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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

      <AlertDialog
        open={Boolean(deleteProject)}
        onOpenChange={(open) => !open && setDeleteProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
