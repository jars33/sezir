import { Pencil, Trash2Icon } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { ProjectDialog } from "@/components/ProjectDialog"
import { toast } from "sonner"
import type { ProjectFormSchema } from "./project-schema"
import { teamsService, projectService } from "@/services/supabase"

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

const statusColors = {
  planned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

interface ProjectListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onSelect: (project: Project) => void
  selectedProject: Project | null
}

export function ProjectList({
  projects,
  onEdit,
  onDelete,
  onSelect,
  selectedProject,
}: ProjectListProps) {
  const { t } = useTranslation()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)

  // Get team names for projects
  const { data: teams } = useQuery({
    queryKey: ["team-names"],
    queryFn: async () => {
      return await teamsService.getTeamNames();
    },
  })

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "planned": return t('project.planned')
      case "in_progress": return t('project.inProgress')
      case "completed": return t('project.completed')
      case "cancelled": return t('project.cancelled')
      default: return status
    }
  }

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToEdit(project)
    setEditDialogOpen(true)
  }

  const handleUpdateProject = async (values: ProjectFormSchema) => {
    try {
      if (!projectToEdit) return

      await projectService.updateProject(projectToEdit.id, {
        number: values.number,
        name: values.name,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: values.status,
        team_id: values.team_id === "no-team" ? null : values.team_id,
      });

      // Close the dialog and show success message
      setEditDialogOpen(false)
      toast.success("Project updated successfully")
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      toast.error("Failed to update project")
      console.error(error)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('project.projectNumber')}</TableHead>
              <TableHead>{t('project.name')}</TableHead>
              <TableHead>{t('project.status')}</TableHead>
              <TableHead>{t('project.team')}</TableHead>
              <TableHead>{t('project.startDate')}</TableHead>
              <TableHead>{t('project.endDate')}</TableHead>
              <TableHead className="w-[100px]">{t('project.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map((project) => (
              <TableRow
                key={project.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  selectedProject?.id === project.id && "bg-muted"
                )}
                onClick={() => onSelect(project)}
              >
                <TableCell>{project.number}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[project.status]}>
                    {getStatusTranslation(project.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.team_id && teams ? teams[project.team_id] : "-"}
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
                      onClick={(e) => handleEditClick(project, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(project)
                      }}
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

      {projectToEdit && (
        <ProjectDialog
          project={projectToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdateProject}
        />
      )}
    </>
  )
}
