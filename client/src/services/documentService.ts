import api from "./api";

export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
  _id: string;
  user: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  storageProvider: "cloudinary" | "s3";
  storageResourceType?: "raw" | "image";
  storageUrl: string;
  storageKey: string;
  isScanned?: boolean;
  extractionMethod?: "text" | "ocr";
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

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get<DocumentsResponse>("/api/documents");

  return response.data.documents;
};

export const getDocumentById = async (id: string): Promise<Document> => {
  const response = await api.get<DocumentResponse>(`/api/documents/${id}`);

  return response.data.document;
};

export const uploadDocument = async (
  file: File,
  options?: { ocr?: boolean }
): Promise<Document> => {
  const formData = new FormData();

  // The field name must match upload.single("file")
  formData.append("file", file);
  if (options?.ocr) {
    formData.append("ocr", "true");
  }

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

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  deletedDocumentId: string;
  deletedChunksCount: number;
  deletedChatsCount: number;
}

export const deleteDocument = async (
  id: string
): Promise<DeleteDocumentResponse> => {
  const response = await api.delete<DeleteDocumentResponse>(
    `/api/documents/${id}`
  );

  return response.data;
};
