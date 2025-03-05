
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMemberList } from "@/components/team/TeamMemberList"
import { TeamMemberTimeline } from "@/components/team/TeamMemberTimeline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/AuthProvider"
import { useState } from "react"
import type { TeamMember } from "@/types/team-member"

export default function Team() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState("timeline")

  const { data: members, refetch } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      return data as TeamMember[]
    },
  })

  const handleEdit = (member: TeamMember) => {
    navigate(`/team/${member.id}`)
  }

  if (!session) return null

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button onClick={() => navigate("/team/new")}>Add Team Member</Button>
      </div>

      <Tabs defaultValue="timeline" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          {activeTab === "timeline" && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xl font-semibold min-w-[100px] text-center">
                {selectedYear}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear(prev => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="list" className="mt-2">
          <TeamMemberList members={members || []} onEdit={handleEdit} onSuccess={() => refetch()} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-2">
          {members?.map((member) => (
            <TeamMemberTimeline key={member.id} member={member} selectedYear={selectedYear} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
