import type { AuthProvider } from "@refinedev/core";
import { roleHome, type Role } from "@/lib/rbac";
import { API_URL } from "./constants";

const AUTH_BASE = `${API_URL}/auth`;

export const authProvider: AuthProvider = {
    login: async ({ email, password, rememberMe }) => {
        try {
            const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe: rememberMe ?? true,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                return { success: false, error: new Error(msg || "Login failed") };
            }

            const s = await fetch(`${AUTH_BASE}/session`, { credentials: "include" });
            if (!s.ok) return { success: true, redirectTo: "/login" };

            const session = await s.json();
            const role = session?.user?.role as Role | undefined;

            return { success: true, redirectTo: roleHome(role) };
        } catch (e: any) {
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
        const res = await fetch(`${API_URL}/me`, {
            credentials: "include",
        });
        if (!res.ok) return null;

        const { user, profile } = await res.json();

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: profile?.fullName ?? user.name ?? "",
            fullName: profile?.fullName ?? user.name ?? "",
            avatarUrl: profile?.avatarUrl ?? user.image ?? undefined,
            phone: profile?.phone ?? undefined,
            city: profile?.city ?? undefined,
            bio: profile?.bio ?? undefined,
        };
    },

    getPermissions: async () => {
        const res = await fetch(`${AUTH_BASE}/session`, { credentials: "include" });
        if (!res.ok) return null;
        const session = await res.json();
        return session.user?.role ?? null;
    },

    onError: async () => ({ logout: false }),
};
