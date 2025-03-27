
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
      // Create the team member data object
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

      // Process team member creation/update
      let newUserCreated = false;
      let invitationSent = false;

      if (!isNewMember && id) {
        // Update existing team member
        console.log("Updating team member with ID:", id);
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
        
        // If email is provided, trigger invitation process through edge function
        if (values.company_email) {
          try {
            console.log("Sending invitation to:", values.company_email);
            
            // Call the edge function to handle user creation and invitation
            const { data, error } = await supabase.functions.invoke("create-and-invite-user", {
              body: {
                email: values.company_email,
                firstName: values.name.split(" ")[0] // Use first name for invitation
              }
            });
            
            if (error) {
              console.error("Error inviting user:", error);
              toast({
                variant: "default", // Changed from "warning" to "default"
                title: "Note",
                description: "Team member created but invitation could not be sent."
              });
            } else {
              console.log("Invitation process result:", data);
              newUserCreated = data?.userCreated || false;
              invitationSent = data?.invitationSent || false;
            }
          } catch (inviteError: any) {
            console.error("Error in invitation process:", inviteError);
            // We don't throw here to avoid blocking team member creation
          }
        }
      }

      return { success: true, newUserCreated, invitationSent };
    } catch (error: any) {
      console.error("Error in onSubmit:", error)
      throw error;
    }
  }

  return { handleSubmit }
}
