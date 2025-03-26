
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TeamMemberList } from "@/components/team/TeamMemberList"
import { TeamMemberTimeline } from "@/components/team/TeamMemberTimeline"
import { TeamMemberDialog } from "@/components/team/TeamMemberDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/AuthProvider"
import { useTranslation } from "react-i18next"
import { useManagedTeamMembers } from "@/hooks/use-managed-team-members"
import type { TeamMember } from "@/types/team-member"

export default function Team() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { toast } = useToast()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState("timeline")
  const [teamMemberDialogOpen, setTeamMemberDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const { t } = useTranslation()

  const { data: members, refetch, isLoading, isError, error } = useManagedTeamMembers()

  console.log("🔍 Team.tsx - Auth session:", session?.user?.id)
  console.log("🔍 Team.tsx - Members data:", members)
  console.log("🔍 Team.tsx - isLoading:", isLoading)
  console.log("🔍 Team.tsx - isError:", isError)
  console.log("🔍 Team.tsx - error:", error)

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member)
    setTeamMemberDialogOpen(true)
  }

  const handleAddNewMember = () => {
    // Reset selected member and open dialog
    setSelectedMember(null)
    setTeamMemberDialogOpen(true)
  }

  const handleModalSuccess = () => {
    refetch()
  }

  if (!session) {
    console.log("⚠️ Team.tsx - No session available")
    return null
  }

  // Even if there's an error, we should still display the page with an "Add Team Member" button
  if (isError) {
    console.error("❌ Team.tsx - Error loading team members:", error)
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{t('team.title')}</h1>
          <Button onClick={handleAddNewMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('team.addTeamMember')}
          </Button>
        </div>
        
        <div className="p-8 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Error loading team members: {error.message || "Please try again later."}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
        
        {session?.user?.id && (
          <TeamMemberDialog
            member={null}
            open={teamMemberDialogOpen}
            onOpenChange={setTeamMemberDialogOpen}
            userId={session.user.id}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    )
  }

  // Ensure the "Add Team Member" button is always visible, even when there are no team members
  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t('team.title')}</h1>
        <Button onClick={handleAddNewMember}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('team.addTeamMember')}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading team members...</div>
      ) : !members || members.length === 0 ? (
        <div className="p-8 mt-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="mb-4">You don't have any team members yet. Start by adding yourself or your first team member.</p>
          <Button onClick={handleAddNewMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Your First Team Member
          </Button>
        </div>
      ) : (
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
            <TeamMemberList 
              members={members} 
              onEdit={handleEdit} 
              onSuccess={() => refetch()} 
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-2">
            {members.map((member) => (
              <TeamMemberTimeline key={member.id} member={member} selectedYear={selectedYear} />
            ))}
          </TabsContent>
        </Tabs>
      )}

      {session?.user?.id && (
        <TeamMemberDialog
          member={selectedMember}
          open={teamMemberDialogOpen}
          onOpenChange={setTeamMemberDialogOpen}
          userId={session.user.id}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
