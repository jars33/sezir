
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMemberList } from "@/components/team/TeamMemberList"
import { TeamMemberTimeline } from "@/components/team/TeamMemberTimeline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/AuthProvider"
import type { TeamMember } from "@/types/team-member"

export default function Team() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()

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
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button onClick={() => navigate("/team/new")}>Add Team Member</Button>
      </div>
      
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <TeamMemberList members={members || []} onEdit={handleEdit} onSuccess={() => refetch()} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {members?.map((member) => (
            <TeamMemberTimeline key={member.id} member={member} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
