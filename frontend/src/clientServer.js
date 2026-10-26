import axios from "axios";
import { API_BASE_URL } from "./api.js";

// backend url
export const BASE_URL = API_BASE_URL;

export const clientServer = axios.create({
    baseURL: BASE_URL,
})

clientServer.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
