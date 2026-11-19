import { useQuery } from "@tanstack/react-query";
import { getChatMessages } from "../services/chatService";

export const useChatMessages = (chatId?: string) => {
    return useQuery({
        queryKey: ["chatMessages", chatId],
        queryFn: () => getChatMessages(chatId!),
        enabled: Boolean(chatId),
    });
};