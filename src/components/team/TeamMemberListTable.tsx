
import { format, parseISO } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { TeamMember } from "@/types/team-member"

interface TeamMemberListTableProps {
  members: TeamMember[]
  onEdit: (member: TeamMember) => void
  onDelete: (member: TeamMember) => void
}

export function TeamMemberListTable({ members, onEdit, onDelete }: TeamMemberListTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy')
    } catch (error) {
      console.error("Error formatting date:", dateString, error)
      return "Invalid date"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Company Email</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.name}</TableCell>
            <TableCell className="capitalize">{member.type}</TableCell>
            <TableCell>{member.left_company ? "Inactive" : "Active"}</TableCell>
            <TableCell>{formatDate(member.start_date)}</TableCell>
            <TableCell>{formatDate(member.end_date)}</TableCell>
            <TableCell>{member.company_email || "-"}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(member)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
