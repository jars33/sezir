
import * as React from "react"
import { useParams } from "react-router-dom"
import { TeamForm } from "@/components/team/TeamForm"
import { TeamMembersList } from "@/components/team/TeamMembersList"
import { TeamDetailsHeader } from "@/components/team/TeamDetailsHeader"
import { DeleteTeamDialog } from "@/components/team/DeleteTeamDialog"
import { useTeamDeletion } from "@/components/team/use-team-deletion"
import { useTeamDetails } from "@/hooks/use-team-details"
import { useTranslation } from "react-i18next"

export default function TeamDetails() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { deleteDialogOpen, setDeleteDialogOpen, handleDeleteTeam } = useTeamDeletion()
  const { team, isTeamLoading, linkedProjects } = useTeamDetails(id)

  if (isTeamLoading) {
    return <div className="p-8">{t('common.loading')}</div>
  }

  return (
    <div className="container py-8">
      <TeamDetailsHeader 
        id={id || "new"} 
        onDeleteClick={() => setDeleteDialogOpen(true)} 
      />

      <div className="max-w-2xl mx-auto space-y-8">
        <TeamForm team={team} id={id} />
        
        {id !== "new" && (
          <TeamMembersList teamId={id || ""} />
        )}
      </div>

      <DeleteTeamDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => handleDeleteTeam(id || "")}
        projectCount={linkedProjects?.length || 0}
      />
    </div>
  )
}
