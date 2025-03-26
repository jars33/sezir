
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { TeamMemberFormSchema } from "./team-member-schema"

export function useTeamMemberSubmit() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (values: TeamMemberFormSchema, isNewMember: boolean, id?: string, userId?: string) => {
    console.log("Starting team member submission with values:", values);
    if (!userId) {
      console.error("No userId provided to handleSubmit")
      throw new Error("You must be logged in to perform this action")
    }

    try {
      const teamMemberData = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        company_phone: values.company_phone || null,
        company_email: values.company_email || null,
        type: values.type,
        left_company: values.left_company,
        user_id: userId,
      }

      console.log("Submitting team member data:", teamMemberData)

      if (!isNewMember) {
        // Update existing team member
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .update(teamMemberData)
          .eq("id", id)

        if (teamMemberError) {
          console.error("Update error:", teamMemberError)
          throw teamMemberError
        }

        console.log("Successfully updated team member");
      } else {
        // Create new team member
        console.log("Creating new team member with data:", teamMemberData);
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .insert(teamMemberData)

        if (teamMemberError) {
          console.error("Insert error:", teamMemberError)
          throw teamMemberError
        }

        console.log("New team member created");
      }

      return true;
    } catch (error: any) {
      console.error("Error in onSubmit:", error)
      throw error;
    }
  }

  return { handleSubmit }
}
