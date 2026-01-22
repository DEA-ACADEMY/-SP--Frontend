import { ShowView } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
    // later you can replace this with data from /me (users table)
    const user = {
        fullName: "—",
        email: "—",
        role: "—",
        branch: "—",
        program: "—",
        lastLogin: "—",
        status: "Active",
    };

    return (
        <ShowView >
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
                            Later we’ll load this from <span className="font-medium">/api/me</span>{" "}
                            (users table) and show role-based fields (student/supervisor/admin/donor).
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ShowView>
    );
}
