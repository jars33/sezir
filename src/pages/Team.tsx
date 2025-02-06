
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TeamMemberList } from "@/components/team/TeamMemberList"
import { TeamMemberDialog } from "@/components/team/TeamMemberDialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import type { TeamMember } from "@/types/team-member"

export default function Team() {
  const [open, setOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
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
    setSelectedMember(member)
    setOpen(true)
  }

  const handleClose = () => {
    setSelectedMember(null)
    setOpen(false)
  }

  const handleSuccess = () => {
    refetch()
    handleClose()
    toast({
      title: "Success",
      description: `Team member ${selectedMember ? "updated" : "added"} successfully`,
    })
  }

  if (!session) return null

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button onClick={() => setOpen(true)}>Add Team Member</Button>
      </div>
      
      <TeamMemberList members={members || []} onEdit={handleEdit} onSuccess={() => refetch()} />
      
      <TeamMemberDialog
        open={open}
        onOpenChange={setOpen}
        member={selectedMember}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
