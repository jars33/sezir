import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TeamMemberList } from "@/components/team/TeamMemberList"
import { TeamMemberTimeline } from "@/components/team/TeamMemberTimeline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/AuthProvider"
import { useTranslation } from "react-i18next"
import { useManagedTeamMembers } from "@/hooks/use-managed-team-members"

export default function Team() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState("timeline")
  const { t } = useTranslation()

  const { data: members, refetch, isLoading } = useManagedTeamMembers()

  const handleEdit = (member) => {
    navigate(`/team/${member.id}`)
  }

  if (!session) return null

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t('team.title')}</h1>
        <Button onClick={() => navigate("/team/new")}>{t('team.addTeamMember')}</Button>
      </div>

      <Tabs defaultValue="timeline" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="timeline">{t('team.timelineView')}</TabsTrigger>
            <TabsTrigger value="list">{t('team.listView')}</TabsTrigger>
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
          {isLoading ? (
            <div className="text-center p-8">Loading team members...</div>
          ) : members && members.length > 0 ? (
            <TeamMemberList members={members} onEdit={handleEdit} onSuccess={() => refetch()} />
          ) : (
            <div className="text-center p-8">No team members found.</div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-2">
          {isLoading ? (
            <div className="text-center p-8">Loading team members...</div>
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <TeamMemberTimeline key={member.id} member={member} selectedYear={selectedYear} />
            ))
          ) : (
            <div className="text-center p-8">No team members found.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
