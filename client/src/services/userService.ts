import api from "./api";

export interface User {
    _id: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    plan: "free" | "pro" | "team";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UserResponse {
    success: boolean;
    message: string;
    user: User;
}

export const getCurrentUser = async(): Promise<User> => {
    const response = await api.get<UserResponse>("/api/auth/me");

    return response.data.user;
}