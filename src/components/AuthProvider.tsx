
import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Session } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { userAccountsService } from "@/services/supabase/user-accounts-service"

type AuthContextType = {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // First, check if there's a current account set
    const initializeSupabase = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error("Error initializing authentication:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeSupabase()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate("/auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
