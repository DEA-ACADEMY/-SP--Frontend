import type { AuthProvider } from "@refinedev/core";

const AUTH_BASE = "http://localhost:8000/api/auth";

type Role = "student" | "supervisor" | "management" | "donor";

function roleHome(role?: Role) {
    switch (role) {
        case "management":
            return "/admin";
        case "supervisor":
            return "/supervisor";
        case "donor":
            return "/donor";
        default:
            return "/"; // student
    }
}

export const authProvider: AuthProvider = {
    login: async ({ email, password, rememberMe }) => {
        try {
            const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, rememberMe: rememberMe ?? true }),
            });

            if (!res.ok) {
                const msg = await res.text();
                return { success: false, error: new Error(msg || "Login failed") };
            }

            const s = await fetch(`${AUTH_BASE}/session`, { credentials: "include" });
            if (!s.ok) return { success: true, redirectTo: "/" };

            const session = await s.json();
            const role = session?.user?.role as Role | undefined;

            return { success: true, redirectTo: roleHome(role) };
        } catch (e: any) {
            // CORS / network failures land here
            return { success: false, error: e };
        }
    },

    logout: async () => {
        await fetch(`${AUTH_BASE}/sign-out`, {
            method: "POST",
            credentials: "include",
        });
        return { success: true, redirectTo: "/login" };
    },

    check: async () => {
        const res = await fetch(`${AUTH_BASE}/session`, { credentials: "include" });
        if (!res.ok) return { authenticated: false, redirectTo: "/login" };
        return { authenticated: true };
    },

    getIdentity: async () => {
        const res = await fetch(`${AUTH_BASE}/session`, { credentials: "include" });
        if (!res.ok) return null;
        const session = await res.json();
        return session.user ?? null;
    },

    getPermissions: async () => {
        const res = await fetch(`${AUTH_BASE}/session`, { credentials: "include" });
        if (!res.ok) return null;
        const session = await res.json();
        return session.user?.role ?? null;
    },

    onError: async () => ({ logout: false }),
};
