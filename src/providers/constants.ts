const isLocalBrowser =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "::1");

export const API_URL = isLocalBrowser
    ? "http://localhost:8000/api"
    : import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
