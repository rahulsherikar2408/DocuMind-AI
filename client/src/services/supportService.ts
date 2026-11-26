import api from "./api";

export type SupportCategory =
  | "general"
  | "billing"
  | "technical"
  | "ocr"
  | "other";

export interface SupportTicket {
  _id: string;
  user: string;
  name: string;
  email: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportTicketPayload {
  category: SupportCategory;
  subject: string;
  message: string;
}

export const createSupportTicket = async (
  payload: CreateSupportTicketPayload
): Promise<{ success: boolean; message: string; ticket: SupportTicket }> => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    ticket: SupportTicket;
  }>("/api/support", payload);
  return data;
};

export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  const { data } = await api.get<{
    success: boolean;
    count: number;
    tickets: SupportTicket[];
  }>("/api/support");
  return data.tickets;
};
