import { useEffect, useMemo, useState } from "react";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type MeResponse = {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        image?: string | null;
    };
    profile:
        | {
        userId: string;
        fullName?: string | null;
        phone?: string | null;
        city?: string | null;
        bio?: string | null;
        notes?: string | null;
        allowedEdit?: boolean | null;
        avatarUrl?: string | null;
    }
        | null;
};

export default function Profile() {
    const [data, setData] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8000/api/me", {
                    credentials: "include",
                });

                if (!res.ok) {
                    if (mounted) setData(null);
                    return;
                }

                const json = (await res.json()) as MeResponse;
                if (mounted) setData(json);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const user = useMemo(() => {
        const u = data?.user;
        const p = data?.profile;

        return {
            fullName: loading ? "…" : (p?.fullName ?? u?.name ?? "—"),
            email: loading ? "…" : (u?.email ?? "—"),
            role: loading ? "…" : (u?.role ?? "—"),

            // you can add these later to profile table if you want
            branch: "—",
            program: "—",
            lastLogin: "—",

            status: "Active",
        };
    }, [data, loading]);

    return (
        <ShowView>
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="space-y-1">
                            <div className="text-muted-foreground">Full name</div>
                            <div className="font-medium">{user.fullName}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-muted-foreground">Email</div>
                            <div className="font-medium">{user.email}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-muted-foreground">Status</div>
                            <div>
                                <Badge variant="secondary">{user.status}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <div className="text-muted-foreground">Role</div>
                                <div className="font-medium">{user.role}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-muted-foreground">Last login</div>
                                <div className="font-medium">{user.lastLogin}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-muted-foreground">Branch</div>
                                <div className="font-medium">{user.branch}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-muted-foreground">Program</div>
                                <div className="font-medium">{user.program}</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="text-muted-foreground">
                            Loaded from <span className="font-medium">/api/me</span>. Next we’ll add edit form +
                            role-based fields.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ShowView>
    );
}
