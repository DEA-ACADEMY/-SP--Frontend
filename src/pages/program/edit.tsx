import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

type Program = {
    id: string;
    name?: string | null;
    branchId?: string | null;
};

type Branch = {
    id: string;
    name?: string | null;
};

export default function ProgramEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [name, setName] = useState("");
    const [branchId, setBranchId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                const [programJson, branchesJson] = await Promise.all([
                    kyInstance.get(`programs/${id}`).json<Program>(),
                    kyInstance.get("branches").json<any>(),
                ]);

                const branchData = Array.isArray(branchesJson)
                    ? branchesJson
                    : (branchesJson?.data ?? []);

                if (!cancelled) {
                    setBranches(branchData);
                    setName(programJson?.name ?? "");
                    setBranchId(programJson?.branchId ?? "");
                }
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? t("programs.messages.failedToLoad"));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (id) run();

        return () => {
            cancelled = true;
        };
    }, [id]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !branchId) {
            setError(t("programs.messages.nameAndBranchRequired"));
            return;
        }

        try {
            setSaving(true);
            await kyInstance.patch(`programs/${id}`, {
                json: {
                    name: name.trim(),
                    branchId,
                },
            });
            navigate("/programs");
        } catch (e: any) {
            setError(e?.message ?? t("programs.messages.failedToUpdate"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="text-muted-foreground">{t("common.loading")}</div>;
    }

    return (
        <div className="w-full max-w-3xl space-y-6">
            <h1 className="text-xl font-semibold">{t("programs.titles.edit")}</h1>

            <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("programs.fields.name")}</label>
                    <input
                        className="w-full border rounded-md px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("programs.fields.branch")}</label>
                    <select
                        className="w-full border rounded-md px-3 py-2 bg-background"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                    >
                        <option value="">{t("programs.placeholders.selectBranch")}</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name ?? t("programs.placeholders.untitledBranch")}
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
                        {saving ? t("common.saving") : t("common.save")}
                    </button>
                </div>
            </form>
        </div>
    );
}
