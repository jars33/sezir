
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
      // Create a new user account if email is provided and it's a new team member
      let newUserCreated = false
      if (isNewMember && values.company_email) {
        console.log("Creating a new user account for:", values.company_email)
        const tempPassword = generateRandomPassword()
        
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: values.company_email,
          password: tempPassword,
          email_confirm: true, // Auto confirm the email
        })
        
        if (userError) {
          // Only throw an error if it's not a "User already registered" error
          if (!userError.message.includes("already registered")) {
            console.error("Error creating user:", userError)
            throw userError
          } else {
            console.log("User already exists:", values.company_email)
          }
        } else {
          console.log("Successfully created user:", userData)
          newUserCreated = true
        }
      }

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

      return { success: true, newUserCreated };
    } catch (error: any) {
      console.error("Error in onSubmit:", error)
      throw error;
    }
  }

  // Helper function to generate a random password
  const generateRandomPassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }

  return { handleSubmit }
}
