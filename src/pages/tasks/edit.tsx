"use client";

import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { useForm } from "@refinedev/react-hook-form";
import type { HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

type Task = {
    id: string;
    title: string;
    description?: string | null;
    dueDate?: string | null; // "YYYY-MM-DD"
};

export default function TaskEdit() {
    const { id } = useParams();

    const {
        refineCore: { onFinish, formLoading, queryResult },
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Task, HttpError>({
        refineCoreProps: {
            resource: "tasks",
            id: id!,
            redirect: "show",
        },
    });

    const task = queryResult?.data?.data;

    return (
        <EditView>
            <div className="flex flex-col gap-4">
                <div className="flex items-center relative gap-2">
                    <div className="bg-background z-[2] pr-4">
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">Edit Task</h2>

                    <Button asChild variant="outline">
                        <Link to={id ? `/tasks/show/${id}` : "/tasks"}>Back</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>

                <CardContent>
                    {formLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit(onFinish)}>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Task title"
                                    defaultValue={task?.title ?? ""}
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title ? (
                                    <p className="text-sm text-destructive">
                                        {String(errors.title.message)}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Task description"
                                    defaultValue={task?.description ?? ""}
                                    {...register("description")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    defaultValue={task?.dueDate ?? ""}
                                    {...register("dueDate")}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button type="submit" disabled={formLoading}>
                                    Save
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </EditView>
    );
}