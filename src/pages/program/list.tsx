import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { authProvider } from "@/providers/auth";
import type { Role } from "@/lib/rbac";

type Program = {
    id: string;
    name?: string | null;
    branchId?: string | null;
};

type Branch = {
    id: string;
    name?: string | null;
};

export default function ProgramsList() {
    const [items, setItems] = useState<Program[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
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
                const [programsRes, branchesRes] = await Promise.all([
                    kyInstance.get("programs"),
                    kyInstance.get("branches"),
                ]);

                const programsJson: any = await programsRes.json();
                const branchesJson: any = await branchesRes.json();

                const programsData = Array.isArray(programsJson)
                    ? programsJson
                    : (programsJson?.data ?? []);

                const branchesData = Array.isArray(branchesJson)
                    ? branchesJson
                    : (branchesJson?.data ?? []);

                if (!cancelled) {
                    setRole(nextRole ?? null);
                    setItems(programsData);
                    setBranches(branchesData);
                }
            } catch (e: any) {
                const msg =
                    e?.response
                        ? `${e.response.status} ${e.response.statusText}`
                        : e?.message ?? "Failed to load programs";

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

    const branchNameById = useMemo(() => {
        return Object.fromEntries(
            branches.map((branch) => [branch.id, branch.name ?? "(untitled branch)"]),
        );
    }, [branches]);

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">Programs</h1>

                {canManage ? (
                    <Link
                        to="/programs/create"
                        className="px-3 py-2 rounded-md border hover:bg-muted"
                    >
                        New Program
                    </Link>
                ) : null}
            </div>

            {loading ? <p className="text-muted-foreground">Loading...</p> : null}

            {error ? <p className="text-destructive">{error}</p> : null}

            {!loading && !error && items.length === 0 ? (
                <p className="text-muted-foreground">No programs yet.</p>
            ) : null}

            <div className="space-y-2">
                {items.map((p) => (
                    <div
                        key={p.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                    >
                        <div>
                            <div className="font-medium">{p.name ?? "(untitled)"}</div>
                            <div className="text-sm text-muted-foreground">
                                Branch: {p.branchId ? (branchNameById[p.branchId] ?? p.branchId) : "-"}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                to={`/programs/show/${p.id}`}
                                className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                            >
                                Open
                            </Link>

                            {canManage ? (
                                <Link
                                    to={`/programs/edit/${p.id}`}
                                    className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                                >
                                    Edit
                                </Link>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}