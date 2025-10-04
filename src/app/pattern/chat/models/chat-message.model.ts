export interface ChatMessage {
  id: string;
  content: string;
  isAssistant: boolean;
  timestamp: Date;
  type: 'text' | 'diagnosis' | 'pharmacy_suggestion' | 'loading';
}

export interface MessageThread {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  status: 'active' | 'closed' | 'archived';
}
