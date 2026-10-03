import axios from "axios";

// backend url
export const BASE_URL = "http://localhost:8080";

export const clientServer = axios.create({
    baseURL: BASE_URL,
})