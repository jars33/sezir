
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
import { projectFormSchema, type ProjectFormValues } from "./projects/project-schema"

interface ProjectDialogProps {
  project?: {
    id: string
    number: string
    name: string
    status: "planned" | "in_progress" | "completed" | "cancelled"
    start_date: string | null
    end_date: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProjectFormValues) => Promise<void>
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  onSubmit,
}: ProjectDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      number: project?.number ?? "",
      name: project?.name ?? "",
      status: project?.status ?? "planned",
      start_date: project?.start_date ? new Date(project.start_date) : null,
      end_date: project?.end_date ? new Date(project.end_date) : null,
    },
  })

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
