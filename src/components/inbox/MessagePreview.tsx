
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Star } from "lucide-react"
import { Message } from "@/types/inbox"
import { useTranslation } from "react-i18next"

interface MessagePreviewProps {
  message: Message | null
  onToggleStarred: (message: Message) => void
}

export function MessagePreview({ message, onToggleStarred }: MessagePreviewProps) {
  const { t } = useTranslation();
  
  if (!message) {
    return (
      <Card className="p-6">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          {t('inbox.selectMessageToView')}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{message.subject}</h2>
            <p className="text-muted-foreground">{t('inbox.from')}: {message.sender_id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleStarred(message)}
              title={message.is_starred ? t('inbox.unstar') : t('inbox.star')}
            >
              <Star
                className={`h-4 w-4 ${
                  message.is_starred ? "text-yellow-500 fill-yellow-500" : ""
                }`}
              />
            </Button>
            <Button variant="outline" size="icon" title={t('inbox.reply')}>
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator />
        <div className="prose max-w-none">
          <p>{message.content}</p>
        </div>
      </div>
    </Card>
  )
}
