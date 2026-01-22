import { ListView } from "@/components/refine-ui/views/list-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ActivityItem = {
    id: string;
    title: string;
    desc: string;
    tag: "task" | "review" | "advice" | "system";
    time: string;
};

const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        title: "Welcome",
        desc: "Your dashboard will show tasks, reviews, and advice activity here.",
        tag: "system",
        time: "—",
    },
];

function TagBadge({ tag }: { tag: ActivityItem["tag"] }) {
    const label =
        tag === "task"
            ? "Task"
            : tag === "review"
                ? "Review"
                : tag === "advice"
                    ? "Advice"
                    : "System";

    return <Badge variant="secondary">{label}</Badge>;
}

export default function Dashboard() {
    // later:
    // - cards come from aggregated endpoints (tasks/submissions/advice/notifications)
    // - activity comes from an "activity" table or derived events
    const stats = {
        openTasks: "—",
        overdue: "—",
        dueSoon: "—",
        notifications: "—",
    };

    return (
        <ListView >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Open Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.openTasks}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.overdue}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Due Soon (7d)</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.dueSoon}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {stats.notifications}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                        <div className="text-xs text-muted-foreground">
                            (Role-based later)
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button variant="default" disabled>
                            Create Task
                        </Button>
                        <Button variant="outline" disabled>
                            Submit Task
                        </Button>
                        <Button variant="outline" disabled>
                            New Consultation
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                        <Button variant="outline" size="sm" disabled>
                            View all
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        {MOCK_ACTIVITY.length === 0 ? (
                            <div className="p-6 text-sm text-muted-foreground">
                                No activity yet.
                            </div>
                        ) : (
                            <div>
                                {MOCK_ACTIVITY.map((a, idx) => (
                                    <div key={a.id}>
                                        <div className="flex items-start justify-between gap-4 p-4">
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <TagBadge tag={a.tag} />
                                                </div>
                                                <div className="font-medium">{a.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {a.desc}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-xs text-muted-foreground">
                                                {a.time}
                                            </div>
                                        </div>
                                        {idx !== MOCK_ACTIVITY.length - 1 ? <Separator /> : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ListView>
    );
}
