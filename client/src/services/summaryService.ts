
import api from "./api";
import type { GenerateSummaryResponse } from "../types/summary";

export const generateDocumentSummary = async (
    documentId: string
): Promise<GenerateSummaryResponse> => {
    const { data } = await api.post<GenerateSummaryResponse>(
        `/api/summaries/${documentId}`
    );

    return data;
};
