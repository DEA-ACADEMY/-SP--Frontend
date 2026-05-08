import { useEffect, useState } from "react";
import { Send } from "lucide-react";

import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/providers/constants";
import { fetchWithAuth } from "@/providers/fetcher";
import { useTranslation } from "react-i18next";
import type { DonorMessage } from "./types";

export default function DonorMessages() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<DonorMessage[]>([]);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadMessages() {
        const response = await fetchWithAuth(`${API_URL}/donor/messages`);
        if (!response.ok) throw new Error(t("donor.messages.failedToLoadMessages"));
        setMessages(await response.json());
    }

    useEffect(() => {
        let active = true;
        loadMessages().catch((e) => {
            if (active) setError(e?.message ?? t("donor.messages.failedToLoadMessages"));
        });
        return () => { active = false; };
    }, [t]);

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const text = message.trim();
        if (!text) return;

        try {
            setSaving(true);
            setError(null);
            const response = await fetchWithAuth(`${API_URL}/donor/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            if (!response.ok) throw new Error(t("donor.messages.failedToSendMessage"));
            setMessage("");
            await loadMessages();
        } catch (e: any) {
            setError(e?.message ?? t("donor.messages.failedToSendMessage"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <ListView>
            <ListViewHeader title={t("nav.messages")} canCreate={false} />
            <div className="grid gap-4">
                <Card>
                    <CardContent className="space-y-4 p-4">
                        {messages.length ? messages.map((item) => (
                            <div key={item.id} className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">
                                    {item.senderName ?? t("common.user")} · {item.senderRole}
                                </div>
                                <p className="mt-2 text-sm">{item.message}</p>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">{t("donor.empty.noMessages")}</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={sendMessage} className="space-y-3">
                            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("donor.placeholders.message")} />
                            {error ? <p className="text-sm text-destructive">{error}</p> : null}
                            <Button type="submit" disabled={saving || !message.trim()}>
                                <Send className="h-4 w-4" />
                                {saving ? t("common.submitting") : t("donor.actions.sendToManagement")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ListView>
    );
}
