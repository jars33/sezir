
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/AuthProvider"
import MainLayout from "@/components/MainLayout"
import Auth from "@/pages/Auth"
import Index from "@/pages/Index"
import Projects from "@/pages/Projects"
import ProjectDetails from "@/pages/ProjectDetails"
import Team from "@/pages/Team"
import TeamMemberDetails from "@/pages/TeamMemberDetails"
import Calendar from "@/pages/Calendar"
import Inbox from "@/pages/Inbox"
import NotFound from "@/pages/NotFound"
import "./App.css"

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="team" element={<Team />} />
              <Route path="team/new" element={<TeamMemberDetails />} />
              <Route path="team/:id" element={<TeamMemberDetails />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
