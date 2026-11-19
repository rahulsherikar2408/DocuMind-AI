import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendMessage } from "../services/chatService";
import type { SendMessagePayload } from "../types/chat";

interface SendMessageVariables {
  chatId: string;
  payload: SendMessagePayload;
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, payload }: SendMessageVariables) =>
      sendMessage(chatId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.chatId],
      });

      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    },
  });
};