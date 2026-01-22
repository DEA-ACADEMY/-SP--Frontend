import type { AuthProvider } from "@refinedev/core";

const AUTH_BASE = "http://localhost:8000/api/auth";

type Role = "student" | "supervisor" | "management" | "donor";

function roleHome(role?: Role) {
    switch (role) {
        case "management":
            return "/";
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
        const res = await fetch("http://localhost:8000/api/me", {
            credentials: "include",
        });
        if (!res.ok) return null;

        const { user, profile } = await res.json();

        // Return a consistent identity object for the UI
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: profile?.fullName ?? user.name ?? "",
            fullName: profile?.fullName ?? user.name ?? "",
            avatarUrl: profile?.avatarUrl ?? user.image ?? undefined,

            // optional extras (handy later)
            phone: profile?.phone ?? undefined,
            city: profile?.city ?? undefined,
            bio: profile?.bio ?? undefined,
            notes: profile?.notes ?? undefined,
            allowedEdit: profile?.allowedEdit ?? undefined,
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
