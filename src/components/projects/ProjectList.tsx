
import { Edit2Icon, Trash2Icon } from "lucide-react"
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

interface ProjectListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  return (
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
                    onClick={() => onEdit(project)}
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(project)}
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
  )
}
