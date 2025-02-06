
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
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
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/AuthProvider"

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

export default function Inbox() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const queryClient = useQueryClient()
  const { session } = useAuth()

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to load messages")
        throw error
      }

      return data as Message[]
    },
  })

  // Update message (read/starred status)
  const updateMessageMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Message>
    }) => {
      const { error } = await supabase
        .from("messages")
        .update(updates)
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] })
    },
    onError: () => {
      toast.error("Failed to update message")
    },
  })

  // Filter messages based on search query
  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle message selection
  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)
    if (!message.is_read) {
      updateMessageMutation.mutate({
        id: message.id,
        updates: { is_read: true },
      })
    }
  }

  // Toggle starred status
  const toggleStarred = async (message: Message) => {
    updateMessageMutation.mutate({
      id: message.id,
      updates: { is_starred: !message.is_starred },
    })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "long" })
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <div className="container py-6 max-w-[1400px]">
      <div className="flex flex-col space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["messages"] })}
            >
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
                      onClick={() => handleMessageClick(message)}
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
                              toggleStarred(message)
                            }}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                message.is_starred
                                  ? "text-yellow-500 fill-yellow-500"
                                  : ""
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
                      From: {selectedMessage.sender_id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleStarred(selectedMessage)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          selectedMessage.is_starred
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
                  <p>{selectedMessage.content}</p>
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
