import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

export default function BranchCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError(t("branches.messages.nameRequired"));
            return;
        }

        try {
            setSaving(true);

            await kyInstance.post("branches", {
                json: {
                    name: name.trim(),
                },
            });

            navigate("/branches");
        } catch (e: any) {
            setError(e?.message ?? t("branches.messages.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="w-full max-w-3xl space-y-6">
            <h1 className="text-xl font-semibold">{t("branches.titles.create")}</h1>

            <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("branches.fields.name")}</label>
                    <input
                        className="w-full border rounded-md px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("branches.placeholders.name")}
                    />
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

                    <button
                        type="button"
                        onClick={() => navigate("/branches")}
                        className="px-4 py-2 rounded-md border hover:bg-muted"
                    >
                        {t("buttons.cancel")}
                    </button>
                </div>
            </form>
        </div>
    );
}
