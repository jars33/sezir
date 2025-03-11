
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "./hooks/useProjectDetails"

interface ProjectHeaderProps {
  project: Project
  hasPermission: boolean
  onNavigateBack: () => void
  onEditProject: () => void
  onDeleteProject: () => void
}

export function ProjectHeader({
  project,
  hasPermission,
  onNavigateBack,
  onEditProject,
  onDeleteProject,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4">
      <Button
        variant="ghost"
        onClick={onNavigateBack}
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
            <Button onClick={onEditProject}>Edit Project</Button>
            <Button
              variant="destructive"
              onClick={onDeleteProject}
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
  )
}
