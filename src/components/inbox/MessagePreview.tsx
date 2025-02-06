
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Star } from "lucide-react"

interface Message {
  id: string
  subject: string
  sender_id: string
  recipient_id: string
  preview: string
  content: string
  created_at: string
  is_read: boolean
  is_starred: boolean
}

interface MessagePreviewProps {
  message: Message | null
  onToggleStarred: (message: Message) => void
}

export function MessagePreview({ message, onToggleStarred }: MessagePreviewProps) {
  if (!message) {
    return (
      <Card className="p-6">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Select a message to view
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
            <p className="text-muted-foreground">From: {message.sender_id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleStarred(message)}
            >
              <Star
                className={`h-4 w-4 ${
                  message.is_starred ? "text-yellow-500 fill-yellow-500" : ""
                }`}
              />
            </Button>
            <Button variant="outline" size="icon">
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
