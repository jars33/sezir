
export type Team = {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  parent_team_id: string | null
  created_at: string
  updated_at: string
}

export type TeamMembership = {
  id: string
  team_id: string
  team_member_id: string
  role: string
  created_at: string
  updated_at: string
  team_member?: {
    id: string
    name: string
  }
}

export type TeamNode = {
  id: string
  name: string
  manager?: {
    id: string
    name: string
  }
  children: TeamNode[]
  members: {
    id: string
    name: string
    role: string
  }[]
}
