"use client";

import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useForm } from "@refinedev/react-hook-form";
import type { HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type Task = {
    id: string;
    createdBy: string;
    title: string;
    description?: string | null;
    dueDate: string; // "YYYY-MM-DD"
    status?: "new" | "in_progress" | "submitted" | "reviewed" | "completed";
    priority?: "low" | "medium" | "high";
};

export default function TaskCreate() {
    const {
        refineCore: { onFinish, formLoading },
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Task, HttpError>({
        refineCoreProps: {
            resource: "tasks",
            redirect: "show", // after create -> /tasks/show/:id
        },
        defaultValues: {
            title: "",
            description: "",
            dueDate: "",
            status: "new",
            priority: "medium",
            createdBy: "00000000-0000-0000-0000-000000000001",
             // ✅ replace with real user id later
        },
    });

    const status = watch("status");
    const priority = watch("priority");

    return (
        <CreateView>
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center relative gap-2">
                    <div className="bg-background z-[2] pr-4">
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">Create Task</h2>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link to="/tasks">Back</Link>
                        </Button>

                        <Button
                            onClick={handleSubmit(onFinish)}
                            disabled={formLoading}
                        >
                            {formLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onFinish)} className="grid gap-6 lg:grid-cols-3">
                {/* Main */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Details</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="Task title..."
                                {...register("title", { required: "Title is required" })}
                            />
                            {errors.title?.message ? (
                                <p className="text-sm text-destructive">{String(errors.title.message)}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Optional..."
                                rows={6}
                                {...register("description")}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Side */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Meta</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5 text-sm">
                        <div className="space-y-2">
                            <Label>Due date</Label>
                            <Input
                                type="date"
                                {...register("dueDate", { required: "Due date is required" })}
                            />
                            {errors.dueDate?.message ? (
                                <p className="text-sm text-destructive">{String(errors.dueDate.message)}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={status ?? "new"}
                                onValueChange={(v) => setValue("status", v as Task["status"])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">new</SelectItem>
                                    <SelectItem value="in_progress">in_progress</SelectItem>
                                    <SelectItem value="submitted">submitted</SelectItem>
                                    <SelectItem value="reviewed">reviewed</SelectItem>
                                    <SelectItem value="completed">completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={priority ?? "medium"}
                                onValueChange={(v) => setValue("priority", v as Task["priority"])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">low</SelectItem>
                                    <SelectItem value="medium">medium</SelectItem>
                                    <SelectItem value="high">high</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* keep createdBy hidden but still sent */}
                        <input type="hidden" {...register("createdBy")} />
                    </CardContent>
                </Card>

                {/* in case user presses Enter */}
                <button type="submit" className="hidden" />
            </form>
        </CreateView>
    );
}
