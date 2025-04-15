
import { useTimelineData } from "./timeline/useTimelineData"
import { TimelineView } from "./timeline/TimelineView"

interface ProjectTimelineViewProps {
  projectId: string
}

export function ProjectTimelineView({ projectId }: ProjectTimelineViewProps) {
  return (
    <TimelineView projectId={projectId} />
  )
}
