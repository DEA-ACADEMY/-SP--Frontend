export const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.headers || {}),
        },
    });
};
