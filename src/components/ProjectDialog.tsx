
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
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation();
  
  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      number: "",
      name: "",
      status: "planned",
      start_date: null,
      end_date: null,
      team_id: "no-team",
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
        team_id: project.team_id || "no-team",
        end_date: project.end_date,
      })
    } else {
      form.reset({
        number: "",
        name: "",
        status: "planned",
        start_date: null,
        end_date: null,
        team_id: "no-team",
      })
    }
  }, [project, form])

  const handleSubmit = async (values: ProjectFormSchema) => {
    // Convert "no-team" to null for the team_id before submitting
    const processedValues = {
      ...values,
      team_id: values.team_id === "no-team" ? null : values.team_id
    };
    
    await onSubmit(processedValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {project ? t('project.editProject') : t('project.createProject')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <ProjectBasicFields form={form} />
            <TeamSelectField form={form} />
            <DialogFooter>
              <Button type="submit">
                {project ? t('project.updateProject') : t('project.createProject')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
