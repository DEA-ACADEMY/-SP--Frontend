import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

type Branch = {
    id: string;
    name?: string | null;
};

export default function ProgramCreate() {
    const { t } = useTranslation();
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
                if (!cancelled) setError(e?.message ?? t("programs.messages.failedToLoadBranches"));
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
            setError(t("programs.messages.nameAndBranchRequired"));
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
            setError(e?.message ?? t("programs.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-3xl space-y-6">
            <h1 className="text-xl font-semibold">{t("programs.titles.create")}</h1>

            <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("programs.fields.name")}</label>
                    <input
                        className="w-full border rounded-md px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("programs.placeholders.name")}
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
                        {saving ? t("common.saving") : t("buttons.create")}
                    </button>
                </div>
            </form>
        </div>
    );
}
