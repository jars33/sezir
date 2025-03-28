import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star } from "lucide-react"
import { Message } from "@/types/inbox"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  selectedMessage: Message | null
  searchQuery: string
  onMessageClick: (message: Message) => void
  onToggleStarred: (message: Message) => void
  formatDate: (dateString: string) => string
}

export function MessageList({
  messages,
  isLoading,
  selectedMessage,
  searchQuery,
  onMessageClick,
  onToggleStarred,
  formatDate,
}: MessageListProps) {
  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-center text-muted-foreground">No messages found</p>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                } ${!message.is_read ? "font-medium" : ""}`}
                onClick={() => onMessageClick(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">From: {message.sender_id}</p>
                    <p className="truncate text-sm">{message.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {message.preview}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4 text-sm">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatDate(message.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleStarred(message)
                      }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          message.is_starred ? "text-yellow-500 fill-yellow-500" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
