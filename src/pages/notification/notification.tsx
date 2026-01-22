import { ListView } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Notif = {
    id: string;
    title: string;
    desc: string;
    type: "task" | "review" | "advice" | "system";
    time: string;
    unread?: boolean;
};

const MOCK: Notif[] = [
    {
        id: "1",
        title: "No notifications yet",
        desc: "When tasks, reviews, or advice replies happen, they will appear here.",
        type: "system",
        time: "—",
        unread: false,
    },
];

function TypeBadge({ type }: { type: Notif["type"] }) {
    const label =
        type === "task"
            ? "Task"
            : type === "review"
                ? "Review"
                : type === "advice"
                    ? "Advice"
                    : "System";

    return <Badge variant="secondary">{label}</Badge>;
}

export default function Notifications() {
    // later:
    // const { tableQueryResult } = useList({ resource: "notifications" });
    // const items = tableQueryResult.data?.data ?? [];
    const items = MOCK;

    return (
        <ListView >
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="text-base">Inbox</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                            Mark all as read
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {items.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div>
                            {items.map((n, idx) => (
                                <div key={n.id}>
                                    <div className="flex items-start justify-between gap-4 p-4">
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <TypeBadge type={n.type} />
                                                {n.unread ? (
                                                    <Badge variant="default">New</Badge>
                                                ) : null}
                                            </div>

                                            <div className="font-medium">{n.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {n.desc}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-xs text-muted-foreground">
                                            {n.time}
                                        </div>
                                    </div>

                                    {idx !== items.length - 1 ? <Separator /> : null}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </ListView>
    );
}
