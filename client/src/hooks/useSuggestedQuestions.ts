
import { useQuery } from "@tanstack/react-query";

import { getSuggestedQuestions } from "../services/suggestedQuestionsService";

export const useSuggestedQuestions = (documentId: string) => {
    return useQuery({
        queryKey: ["suggestedQuestions", documentId],
        queryFn: () => getSuggestedQuestions(documentId),
        enabled: Boolean(documentId),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};
