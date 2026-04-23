import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";

type Branch = {
    id: string;
    name?: string | null;
};

export default function BranchEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setLoading(true);
                setError(null);

                const branch = await kyInstance.get(`branches/${id}`).json<Branch>();

                if (!cancelled) {
                    setName(branch?.name ?? "");
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? t("branches.messages.failedToLoad"));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (id) {
            run();
        }

        return () => {
            cancelled = true;
        };
    }, [id]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError(t("branches.messages.nameRequired"));
            return;
        }

        try {
            setSaving(true);

            await kyInstance.patch(`branches/${id}`, {
                json: {
                    name: name.trim(),
                },
            });

            navigate("/branches");
        } catch (e: any) {
            setError(e?.message ?? t("branches.messages.failedToUpdate"));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="text-muted-foreground">{t("common.loading")}</div>;
    }

    return (
        <div className="w-full max-w-3xl space-y-6">
            <h1 className="text-xl font-semibold">{t("branches.titles.edit")}</h1>

            <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t("branches.fields.name")}</label>
                    <input
                        className="w-full border rounded-md px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
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
