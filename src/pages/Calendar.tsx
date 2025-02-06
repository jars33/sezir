
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Toggle } from "@/components/ui/toggle"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { CalendarProjectView } from "@/components/calendar/CalendarProjectView"
import { CalendarTeamView } from "@/components/calendar/CalendarTeamView"

export default function CalendarPage() {
  const [view, setView] = useState<"projects" | "team">("projects")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const { data: projects } = useQuery({
    queryKey: ["calendar-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .not("start_date", "is", null)
      
      if (error) throw error
      return data
    },
  })

  const { data: teamMembers } = useQuery({
    queryKey: ["calendar-team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .not("start_date", "is", null)
      
      if (error) throw error
      return data
    },
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <Toggle
            pressed={view === "projects"}
            onPressedChange={() => setView("projects")}
          >
            Projects
          </Toggle>
          <Toggle
            pressed={view === "team"}
            onPressedChange={() => setView("team")}
          >
            Team Members
          </Toggle>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-8">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          
          {view === "projects" ? (
            <CalendarProjectView
              date={selectedDate}
              projects={projects ?? []}
            />
          ) : (
            <CalendarTeamView
              date={selectedDate}
              teamMembers={teamMembers ?? []}
            />
          )}
        </div>
      </div>
    </div>
  )
}
