
export interface Message {
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
