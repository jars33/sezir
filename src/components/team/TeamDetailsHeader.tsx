
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

interface TeamDetailsHeaderProps {
  id: string
  onDeleteClick: () => void
}

export function TeamDetailsHeader({ id, onDeleteClick }: TeamDetailsHeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold">
        {id === "new" ? t('team.newTeam') : t('team.editTeam')}
      </h1>
      <div className="flex gap-4">
        {id !== "new" && (
          <Button 
            variant="destructive" 
            onClick={onDeleteClick}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('team.deleteTeam')}
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate("/teams")}>
          {t('team.backToTeams')}
        </Button>
      </div>
    </div>
  )
}
