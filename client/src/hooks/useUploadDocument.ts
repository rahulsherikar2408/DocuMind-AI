import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { uploadDocument } from "../services/documentService";

export const useUploadDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadDocument,

        onSuccess: () => {
            // Refresh the documents list
            queryClient.invalidateQueries({
                queryKey: ["documents"],
            });

            // Refresh dashboard data if it uses this query
            queryClient.invalidateQueries({
                queryKey: ["dashboard"],
            });
        },
    });
};