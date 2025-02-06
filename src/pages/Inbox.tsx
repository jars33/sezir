
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import {
  Mail,
  Star,
  Archive,
  Trash2,
  RefreshCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Message {
  id: string
  subject: string
  sender: string
  preview: string
  date: string
  isRead: boolean
  isStarred: boolean
}

// Temporary mock data - replace with actual data fetching later
const mockMessages: Message[] = [
  {
    id: "1",
    subject: "Project Update - Q1 Goals",
    sender: "Sarah Johnson",
    preview: "Here's the latest update on our Q1 project goals and milestones...",
    date: "10:30 AM",
    isRead: false,
    isStarred: true,
  },
  {
    id: "2",
    subject: "Team Meeting Notes",
    sender: "Mike Davidson",
    preview: "Attached are the notes from yesterday's team sync meeting...",
    date: "Yesterday",
    isRead: true,
    isStarred: false,
  },
  {
    id: "3",
    subject: "New Design System Guidelines",
    sender: "Design Team",
    preview: "We've updated our design system with new component specifications...",
    date: "2 days ago",
    isRead: true,
    isStarred: false,
  },
]

export default function Inbox() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const { data: messages = mockMessages, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      // Replace with actual API call
      return mockMessages
    },
  })

  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-6 max-w-[1400px]">
      <div className="flex flex-col space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Messages List and Preview */}
        <div className="grid grid-cols-[350px,1fr] gap-4">
          {/* Messages List */}
          <Card>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      } ${!message.isRead ? "font-medium" : ""}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{message.sender}</p>
                          <p className="truncate text-sm">
                            {message.subject}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {message.preview}
                          </p>
                        </div>
                        <div className="flex flex-col items-end ml-4 text-sm">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {message.date}
                          </span>
                          {message.isStarred && (
                            <Star className="h-4 w-4 text-yellow-500 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Message Preview */}
          <Card className="p-6">
            {selectedMessage ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-muted-foreground">
                      From: {selectedMessage.sender}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon">
                      <Star
                        className={`h-4 w-4 ${
                          selectedMessage.isStarred
                            ? "text-yellow-500 fill-yellow-500"
                            : ""
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
                  <p>{selectedMessage.preview}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a message to view
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
