
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeamMember, SalaryHistory } from "@/types/team-member"

interface TeamMemberTableProps {
  member: TeamMember
  salaryHistory?: SalaryHistory[]
}

export function TeamMemberTable({ member, salaryHistory }: TeamMemberTableProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return format(new Date(date), "MMM d, yyyy")
  }

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell>{member.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Type</TableCell>
                <TableCell className="capitalize">{member.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Start Date</TableCell>
                <TableCell>{formatDate(member.start_date)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">End Date</TableCell>
                <TableCell>{formatDate(member.end_date)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>{member.left_company ? "Inactive" : "Active"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Company Email</TableCell>
                <TableCell>{member.company_email || "-"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Company Phone</TableCell>
                <TableCell>{member.company_phone || "-"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {salaryHistory && salaryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryHistory.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell>{formatDate(salary.start_date)}</TableCell>
                    <TableCell>{formatDate(salary.end_date)}</TableCell>
                    <TableCell className="text-right">{formatSalary(salary.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
