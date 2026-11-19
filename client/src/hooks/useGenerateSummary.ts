
import { useMutation } from "@tanstack/react-query";

import { generateDocumentSummary } from "../services/summaryService";

export const useGenerateSummary = () => {
    return useMutation({
        mutationFn: (documentId: string) =>
            generateDocumentSummary(documentId),
    });
};
