export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
    id: string;
    name: string;
    date: string;
    size: string;
    pages: number;
    status: DocumentStatus;
    extractionMethod?: "text" | "ocr";
    isScanned?: boolean;
}