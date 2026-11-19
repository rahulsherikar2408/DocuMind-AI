import { useQuery } from "@tanstack/react-query";
import { getChats } from "../services/chatService";

export const useChats = () => {
    return useQuery({
        queryKey: ["chats"],
        queryFn: getChats,
    });
};