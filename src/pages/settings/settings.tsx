import { EditView } from "@/components/refine-ui/views/edit-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Settings() {
    // later: useForm({ resource: "user_settings" })
    return (
        <EditView >
            <div className="space-y-6 max-w-3xl">
                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Enable notifications</Label>
                            <Switch />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <Label>Email notifications</Label>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Appearance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Dark mode</Label>
                            <Switch />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <Label>Compact layout</Label>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Account */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Account-level actions
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline">Change password</Button>
                            <Button variant="destructive">Logout</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </EditView>
    );
}
