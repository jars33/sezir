
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProjectStatus } from "@/services/supabase/project-service";

interface ProjectHeaderProps {
  projectNumber: string;
  projectName: string;
  projectStatus: ProjectStatus;
  hasPermission: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ProjectHeader({
  projectNumber,
  projectName,
  projectStatus,
  hasPermission,
  onEditClick,
  onDeleteClick,
}: ProjectHeaderProps) {
  const navigate = useNavigate();

  return (
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
          {projectNumber} - {projectName}
        </h1>
        <p className="text-sm text-gray-500">
          Status: {projectStatus?.replace("_", " ") || "planned"}
        </p>
      </div>
      <div className="flex space-x-2 self-end md:col-start-3 md:justify-end md:self-center">
        {hasPermission ? (
          <>
            <Button onClick={onEditClick}>Edit Project</Button>
            <Button variant="destructive" onClick={onDeleteClick}>
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
  );
}
