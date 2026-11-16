import { useQuery } from "@tanstack/react-query";
import {
  getDocuments,
  getDocumentById,
} from "../services/documentService";

export const useDocuments = () => {
    return useQuery({
        queryKey: ["documents"],
        queryFn: getDocuments,
        retry: false,
    });
};

export const useDocument = (id: string) => {
    return useQuery({
        queryKey: ["documents", id],
        queryFn: () => getDocumentById(id),
        enabled: Boolean(id),
        retry: false,
    });
};