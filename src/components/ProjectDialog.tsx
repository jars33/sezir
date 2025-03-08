
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { ProjectBasicFields } from "./projects/ProjectBasicFields"
import { projectFormSchema, type ProjectFormSchema } from "./projects/project-schema"
import { useEffect } from "react"
import { TeamSelectField } from "./projects/TeamSelectField"

interface ProjectDialogProps {
  project?: {
    id: string
    number: string
    name: string
    status: "planned" | "in_progress" | "completed" | "cancelled"
    start_date: string | null
    end_date: string | null
    team_id: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProjectFormSchema) => Promise<void>
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  onSubmit,
}: ProjectDialogProps) {
  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      number: "",
      name: "",
      status: "planned",
      start_date: null,
      end_date: null,
      team_id: null,
    },
  })

  // Reset form with project data when editing
  useEffect(() => {
    if (project) {
      form.reset({
        number: project.number,
        name: project.name,
        status: project.status,
        start_date: project.start_date,
        team_id: project.team_id,
        end_date: project.end_date,
      })
    } else {
      form.reset({
        number: "",
        name: "",
        status: "planned",
        start_date: null,
        end_date: null,
        team_id: null,
      })
    }
  }, [project, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ProjectBasicFields form={form} />
            <TeamSelectField form={form} />
            <DialogFooter>
              <Button type="submit">
                {project ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
