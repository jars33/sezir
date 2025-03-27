
import { useState } from "react"
import { TeamMemberListTable } from "./TeamMemberListTable"
import { DeleteTeamMemberDialog } from "./DeleteTeamMemberDialog"
import { useTeamMemberDelete } from "@/hooks/use-team-member-delete"
import type { TeamMember } from "@/types/team-member"

interface TeamMemberListProps {
  members: TeamMember[]
  onEdit: (member: TeamMember) => void
  onSuccess: () => void
}

export function TeamMemberList({ members, onEdit, onSuccess }: TeamMemberListProps) {
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    memberToDelete,
    isReferencedByTeam,
    handleDelete,
    confirmDelete
  } = useTeamMemberDelete(onSuccess)

  return (
    <div>
      <TeamMemberListTable 
        members={members}
        onEdit={onEdit}
        onDelete={confirmDelete}
      />

      <DeleteTeamMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        includesUserAccount={memberToDelete?.company_email ? true : false}
        isReferencedByTeam={isReferencedByTeam}
      />
    </div>
  )
}
