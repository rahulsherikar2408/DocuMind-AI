export interface ChatDocument {
  _id: string;
  fileName: string;
  pageCount: number;
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface Chat {
  _id: string;
  user: string;
  document: string | ChatDocument | null;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageSource {
  document: string | ChatDocument;
  pageNumber: number;
  chunkIndex: number;
  score: number;
}

export interface ChatMessage {
  _id: string;
  chat: string;
  role: "user" | "assistant";
  content: string;
  sources: MessageSource[];
  createdAt: string;
  updatedAt: string;
}


export interface CreateChatPayload {
  documentId?: string;
}

export interface CreateChatResponse {
  success: boolean;
  message: string;
  chat: Chat;
}

export interface GetChatsResponse {
  success: boolean;
  count: number;
  chats: Chat[];
}

export interface GetChatResponse {
  success: boolean;
  chat: Chat;
}

export interface SendMessagePayload {
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface GetChatMessagesResponse {
  success: boolean;
  count: number;
  messages: ChatMessage[];
}
