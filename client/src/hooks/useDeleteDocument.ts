import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocument } from "../services/documentService";

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),

    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["currentSubscription"] });
      queryClient.removeQueries({ queryKey: ["document", documentId] });
    },
  });
};
