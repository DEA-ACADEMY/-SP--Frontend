"use client";

import { ShowView } from "@/components/refine-ui/views/show-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useShow } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

type Task = {
    id: string;
    title: string;
    description?: string | null;
    dueDate?: string | null;
    status?: "new" | "in_progress" | "submitted" | "reviewed" | "completed";
    priority?: "low" | "medium" | "high";
};

function StatusBadge({ status }: { status?: Task["status"] }) {
    if (!status) return <Badge variant="outline">—</Badge>;
    return <Badge variant="outline">{status}</Badge>;
}

function PriorityBadge({ priority }: { priority?: Task["priority"] }) {
    if (!priority) return <Badge variant="secondary">—</Badge>;
    return (
        <Badge variant={priority === "high" ? "destructive" : "secondary"}>
            {priority}
        </Badge>
    );
}

export default function TaskShow() {
    const { id } = useParams();

    const { query } = useShow<Task>({ resource: "tasks", id: id! });

    const isLoading = query.isLoading;
    const isError = query.isError;
    const task = query.data?.data;

    return (
        <ShowView>
            {/* Header (same style as your ListViewHeader, but inline so it always works) */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center relative gap-2">
                    <div className="bg-background z-[2] pr-4">
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">Task Details</h2>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link to="/tasks">Back</Link>
                        </Button>

                        {id ? (
                            <Button asChild>
                                <Link to={`/tasks/edit/${id}`}>Edit</Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading task...
                </div>
            ) : isError ? (
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        Failed to load this task.
                    </CardContent>
                </Card>
            ) : !task ? (
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        Task not found.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Title</div>
                                <div className="text-lg font-semibold">{task.title}</div>
                            </div>

                            <Separator />

                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Description</div>
                                <div className="text-sm">
                                    {task.description?.trim() ? task.description : "—"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Side */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Meta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Status</span>
                                <StatusBadge status={task.status} />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Priority</span>
                                <PriorityBadge priority={task.priority} />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">Due date</span>
                                <span className="font-medium">{task.dueDate ?? "—"}</span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">ID</span>
                                <span className="font-mono text-xs">{task.id}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </ShowView>
    );
}
