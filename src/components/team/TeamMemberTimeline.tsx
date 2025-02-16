
import { useQuery } from "@tanstack/react-query"
import { format, startOfMonth } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import type { TeamMember } from "@/types/team-member"

interface TeamMemberTimelineProps {
  member: TeamMember
}

interface AllocationData {
  id: string
  month: string
  allocation_percentage: number
  project: {
    id: string
    name: string
    number: string
  }
}

export function TeamMemberTimeline({ member }: TeamMemberTimelineProps) {
  const { data: allocations } = useQuery({
    queryKey: ["team-member-allocations", member.id],
    queryFn: async () => {
      const yearStart = format(startOfMonth(new Date()), 'yyyy-01-01')
      const yearEnd = format(startOfMonth(new Date()), 'yyyy-12-31')

      const { data, error } = await supabase
        .from("project_member_allocations")
        .select(`
          id,
          month,
          allocation_percentage,
          project_assignments!inner (
            project:projects(
              id,
              name,
              number
            )
          )
        `)
        .eq("project_assignments.team_member_id", member.id)
        .gte("month", yearStart)
        .lte("month", yearEnd)
        .order("month")

      if (error) throw error

      // Transform the data to make it easier to work with
      return data.map(allocation => ({
        id: allocation.id,
        month: allocation.month,
        allocation_percentage: allocation.allocation_percentage,
        project: allocation.project_assignments.project
      })) as AllocationData[]
    },
  })

  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(new Date().getFullYear(), i, 1)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{member.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {months.map((month) => {
            const monthStr = format(month, "yyyy-MM")
            const monthAllocations = allocations?.filter(allocation => 
              format(new Date(allocation.month), "yyyy-MM") === monthStr
            ) || []
            
            const totalAllocation = monthAllocations.reduce(
              (sum, allocation) => sum + allocation.allocation_percentage, 
              0
            )

            return (
              <div 
                key={month.getTime()} 
                className={`bg-white p-2 min-h-[80px] ${
                  totalAllocation > 100 ? 'bg-red-50' : 
                  totalAllocation === 100 ? 'bg-green-50' : 
                  totalAllocation > 0 ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="text-xs font-medium mb-1 text-center">
                  {format(month, "MMM")}
                </div>
                <div className="space-y-1">
                  {monthAllocations.map((allocation) => (
                    <div
                      key={allocation.id}
                      className="text-xs p-1 bg-white border rounded"
                      title={`${allocation.project.name} (${allocation.project.number})`}
                    >
                      {allocation.allocation_percentage}%
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
