import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadDocument } from "../services/documentService";

export type UploadDocumentInput =
  | File
  | {
      file: File;
      ocr?: boolean;
    };

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadDocumentInput) => {
      if (input instanceof File) {
        return uploadDocument(input);
      }
      return uploadDocument(input.file, { ocr: input.ocr });
    },

    onSuccess: () => {
      // Refresh the documents list
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });

      // Refresh dashboard data if it uses this query
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      // Refresh daily upload count & usage stats
      queryClient.invalidateQueries({
        queryKey: ["currentSubscription"],
      });
    },
  });
};
