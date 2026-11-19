import api from "./api";

export type DocumentStatus = | "pending" | "processing" | "completed" | "failed";

export interface Document {
    _id: string;
    user: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    pageCount: number;
    storageProvider: "cloudinary" | "s3";
    storageUrl: string;
    storageKey: string;
    status: DocumentStatus;
    errorMessage: string;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface DocumentsResponse {
    success: boolean;
    count: number;
    documents: Document[];
}

interface DocumentResponse {
    success: boolean;
    document: Document;
}

export const getDocuments = async(): Promise<Document[]> => {
    const response = await api.get<DocumentsResponse>("/api/documents");

    return response.data.documents;
};

export const getDocumentById = async(id: string): Promise<Document> => {
    const response = await api.get<DocumentResponse>(`/api/documents/${id}`);

    return response.data.document;
};

export const uploadDocument = async(file: File): Promise<Document> => {
    const formData = new FormData();

    // The field name must match upload.single("file")
    formData.append("file", file);

    const response = await api.post<{
        success: boolean;
        message: string;
        document: Document;
    }>("/api/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.document;
};