
import React from "react"
import { Navigate } from "react-router-dom"

// This component is no longer used as we've moved to a modal-based approach
export default function TeamMemberDetails() {
  // Redirect to the team list page
  return <Navigate to="/team" replace />
}
