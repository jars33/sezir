
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teamsService } from "@/services/supabase";
import { toast } from "sonner";
import type { ProjectStatus } from "@/services/supabase/project-service";
import { useTranslation } from "react-i18next";

interface ProjectHeaderProps {
  projectNumber: string;
  projectName: string;
  projectStatus: ProjectStatus;
  projectId: string;
  teamId: string | null;
  hasPermission: boolean;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onTeamChange: (teamId: string | null) => Promise<void>;
}

export function ProjectHeader({
  projectNumber,
  projectName,
  projectStatus,
  projectId,
  teamId,
  hasPermission,
  onEditClick,
  onDeleteClick,
  onTeamChange,
}: ProjectHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch teams for the dropdown
  const { data: teams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ["teams-dropdown"],
    queryFn: async () => {
      return await teamsService.getTeams();
    },
  });

  const handleTeamChange = async (value: string) => {
    try {
      // Convert "no-team" to null
      const newTeamId = value === "no-team" ? null : value;
      await onTeamChange(newTeamId);
      toast.success(t('project.teamUpdated'));
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error(t('project.teamUpdateError'));
    }
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="self-start md:col-start-1 w-24"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')}
      </Button>
      
      <div className="w-full text-center md:col-start-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate max-w-[500px] mx-auto">
          {projectNumber} - {projectName}
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center mt-2 gap-2">
          <p className="text-sm text-gray-500">
            {t('project.status')}: {t(`project.${projectStatus}`) || t('project.planned')}
          </p>
          
          {hasPermission && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="text-sm text-gray-500">{t('project.team')}:</span>
              <Select
                value={teamId || "no-team"}
                onValueChange={handleTeamChange}
                disabled={!hasPermission || isTeamsLoading}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder={t('project.selectTeam')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-team">{t('project.noTeam')}</SelectItem>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {!hasPermission && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="text-sm text-gray-500">
                {t('project.team')}: {teams?.find(t => t.id === teamId)?.name || t('project.noTeam')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2 self-end md:col-start-3 md:justify-end md:self-center">
        {hasPermission ? (
          <>
            <Button onClick={onEditClick}>{t('project.editProject')}</Button>
            <Button variant="destructive" onClick={onDeleteClick}>
              {t('project.deleteProject')}
            </Button>
          </>
        ) : (
          <div className="text-sm text-amber-500">
            {t('project.noPermission')}
          </div>
        )}
      </div>
    </div>
  );
}
