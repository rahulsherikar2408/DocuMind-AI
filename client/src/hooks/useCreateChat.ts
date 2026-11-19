import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createChat } from "../services/chatService";
import type { CreateChatPayload } from "../types/chat";

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChatPayload) =>
      createChat(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    },
  });
};