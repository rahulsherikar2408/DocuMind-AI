
import api from "./api";

import type {
    SuggestedQuestionsResponse,
} from "../types/suggestedQuestions";

export const getSuggestedQuestions = async (
    documentId: string
): Promise<SuggestedQuestionsResponse> => {
    const { data } = await api.get<SuggestedQuestionsResponse>(
        `/api/suggested-questions/${documentId}`
    );

    return data;
};
