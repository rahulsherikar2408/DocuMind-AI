import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChat } from "../services/chatService";

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => deleteChat(chatId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    },
  });
};
