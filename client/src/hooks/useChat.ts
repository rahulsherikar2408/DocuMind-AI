import { useQuery } from "@tanstack/react-query";
import { getChatById } from "../services/chatService";

export const useChat = (chatId?: string) => {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChatById(chatId!),
    enabled: Boolean(chatId),
  });
};