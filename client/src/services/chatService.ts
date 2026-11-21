import api from "./api";

import type {
  Chat,
  ChatMessage,
  CreateChatPayload,
  CreateChatResponse,
  GetChatsResponse,
  GetChatResponse,
  SendMessagePayload,
  SendMessageResponse,
  GetChatMessagesResponse,
  DeleteChatResponse,
} from "../types/chat";

// Create a new chat
export const createChat = async(payload: CreateChatPayload): Promise<Chat> => {
    const { data } = await api.post<CreateChatResponse>("/api/chats", payload);

    return data.chat;
};

// Get all chats
export const getChats = async(): Promise<Chat[]> => {
    const { data } = await api.get<GetChatsResponse>("/api/chats");

    return data.chats;
}

// Get a particular chat
export const getChatById = async(chatId: string): Promise<Chat> => {
    const { data } = await api.get<GetChatResponse>(`/api/chats/${chatId}`);

    return data.chat;
}

// Send a message
export const sendMessage = async(chatId: string, payload: SendMessagePayload): Promise<SendMessageResponse> => {
    const { data } = await api.post<SendMessageResponse>(`/api/chats/${chatId}/messages`, payload);

    return data;
};

// Get chat messages
export const getChatMessages = async(chatId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get<GetChatMessagesResponse>(`/api/chats/${chatId}/messages`);

    return data.messages;
};

// Delete a chat
export const deleteChat = async(chatId: string): Promise<DeleteChatResponse> => {
    const { data } = await api.delete<DeleteChatResponse>(`/api/chats/${chatId}`);

    return data;
};
