import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { kyInstance } from "@/providers/data";

type Branch = {
    id: string;
    name?: string | null;
};

export default function ProgramCreate() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [name, setName] = useState("");
    const [branchId, setBranchId] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const json: any = await kyInstance.get("branches").json();
                const data = Array.isArray(json) ? json : (json?.data ?? []);
                if (!cancelled) setBranches(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load branches");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !branchId) {
            setError("Name and branch are required");
            return;
        }

        try {
            setSaving(true);
            await kyInstance.post("programs", {
                json: {
                    name: name.trim(),
                    branchId,
                },
            });
            navigate("/programs");
        } catch (e: any) {
            setError(e?.message ?? "Failed to create program");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-xl font-semibold mb-4">Create Program</h1>

            <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Program Name</label>
                    <input
                        className="w-full border rounded-md px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Leadership Program"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Branch</label>
                    <select
                        className="w-full border rounded-md px-3 py-2 bg-background"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                    >
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name ?? branch.id}
                            </option>
                        ))}
                    </select>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-md border hover:bg-muted disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}