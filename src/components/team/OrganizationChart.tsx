
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamNode } from "@/types/team";
import { ChevronDown, ChevronRight, Users } from "lucide-react";

interface OrganizationChartProps {
  teams: TeamNode[];
}

export function OrganizationChart({ teams }: OrganizationChartProps) {
  const navigate = useNavigate();
  
  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground mb-4">No teams created yet</p>
        <Button onClick={() => navigate("/teams/new")}>Create Your First Team</Button>
      </div>
    );
  }
  
  return (
    <div className="org-chart">
      {teams.map((team) => (
        <TeamNodeCard key={team.id} team={team} level={0} />
      ))}
    </div>
  );
}

interface TeamNodeCardProps {
  team: TeamNode;
  level: number;
}

function TeamNodeCard({ team, level }: TeamNodeCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = team.children && team.children.length > 0;
  
  return (
    <div className="team-node-wrapper mb-4" style={{ marginLeft: `${level * 24}px` }}>
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="grow">
              <div className="flex items-center">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 mr-1"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
                <h3 className="text-lg font-semibold">{team.name}</h3>
              </div>
              
              {team.manager && (
                <div className="mt-1 text-sm text-muted-foreground">
                  Manager: {team.manager.name}
                </div>
              )}

              {team.members && team.members.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Team Members:</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="text-xs px-2 py-1 bg-secondary rounded-full"
                      >
                        {member.name}
                        {member.role === "lead" && (
                          <span className="ml-1 text-primary">(Lead)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {expanded && hasChildren && (
        <div className="children-container mt-2">
          {team.children.map((child) => (
            <TeamNodeCard key={child.id} team={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
