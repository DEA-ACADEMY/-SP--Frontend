import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { authProvider } from "@/providers/auth";
import type { Role } from "@/lib/rbac";
import { useTranslation } from "react-i18next";

type Branch = {
    id: string;
    name?: string | null;
    createdAt?: string | null;
};

export default function BranchesList() {
    const { t } = useTranslation();
    const [items, setItems] = useState<Branch[]>([]);
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);

                const nextRole = (await authProvider.getPermissions?.()) as Role | null;
                const response = await kyInstance.get("branches");
                const json: any = await response.json();

                const data = Array.isArray(json) ? json : (json?.data ?? []);

                if (!cancelled) {
                    setRole(nextRole ?? null);
                    setItems(data);
                }
            } catch (e: any) {
                const msg =
                    e?.response
                        ? `${e.response.status} ${e.response.statusText}`
                        : e?.message ?? t("branches.messages.failedToLoadList");

                if (!cancelled) setError(msg);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, []);

    const canManage = role === "management";

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">{t("branches.titles.list")}</h1>

                {canManage ? (
                    <Link
                        to="/branches/create"
                        className="px-3 py-2 rounded-md border hover:bg-muted"
                    >
                        {t("branches.actions.new")}
                    </Link>
                ) : null}
            </div>

            {loading ? <p className="text-muted-foreground">{t("common.loading")}</p> : null}
            {error ? <p className="text-destructive">{error}</p> : null}

            {!loading && !error && items.length === 0 ? (
                <p className="text-muted-foreground">{t("branches.messages.empty")}</p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((branch) => (
                    <div
                        key={branch.id}
                        className="border rounded-lg p-4 flex items-center justify-between gap-3"
                    >
                        <div className="min-w-0 truncate font-medium">
                            {branch.name ?? t("common.untitled")}
                        </div>

                        <div className="flex gap-2">
                            <Link
                                to={`/branches/show/${branch.id}`}
                                className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                            >
                                {t("common.open")}
                            </Link>

                            {canManage ? (
                                <Link
                                    to={`/branches/edit/${branch.id}`}
                                    className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                                >
                                    {t("buttons.edit")}
                                </Link>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
