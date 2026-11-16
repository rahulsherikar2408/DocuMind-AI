import axios from "axios";

// Function that will retrieve the current Clerk token
let getClerkToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (
    getter: () => Promise<string | null>
) => {
    getClerkToken = getter;
};

// Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach Clerk token to every request
api.interceptors.request.use(async(config) => {
    if(getClerkToken) {
        const token = await getClerkToken();

        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

export default api;