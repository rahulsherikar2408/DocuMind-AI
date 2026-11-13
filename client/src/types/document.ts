export type DocumentStatus = "Completed" | "Processing" | "Failed";

export interface Document {
    id: string;
    name: string;
    date: string;
    size: string;
    pages: number;
    status: DocumentStatus;
}