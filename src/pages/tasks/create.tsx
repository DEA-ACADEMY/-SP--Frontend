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
import { useList } from "@refinedev/core";
import type { HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type Student = {
    id: string;
    name: string | null;
    email: string;
};

type Task = {
    id: string;

    title: string;
    description?: string | null;
    dueDate: string; // "YYYY-MM-DD"

    assignAll?: boolean;
    assigneeIds?: string[];
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
            redirect: "show",
        },
        defaultValues: {
            title: "",
            description: "",
            dueDate: "",
            assignAll: false,
            assigneeIds: [],
        },
    });

    const assignAll = (watch("assignAll") ?? false) as boolean;
    const selectedStudentId = ((watch("assigneeIds") ?? [])[0] ?? "") as string;

    // ✅ in your refine version: useList returns "query", not "isLoading"
    const { query: studentsQuery, result: studentsRes } = useList<Student, HttpError>({
        resource: "students",
        pagination: { mode: "off" },
    });

    const studentsLoading = studentsQuery?.isLoading ?? false;
    const students: Student[] = studentsRes?.data ?? [];

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

                        {/* Assign all */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={assignAll}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setValue("assignAll", checked);
                                    if (checked) setValue("assigneeIds", []);
                                }}
                            />
                            <Label>Assign to all students</Label>
                        </div>

                        {/* Assign to one student */}
                        <div className="space-y-2">
                            <Label>Assign to student</Label>
                            <Select
                                value={selectedStudentId}
                                onValueChange={(id) => setValue("assigneeIds", id ? [id] : [])}
                                disabled={assignAll || studentsLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={studentsLoading ? "Loading..." : "Select student"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name ?? s.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {!assignAll && !selectedStudentId ? (
                                <p className="text-xs text-muted-foreground">
                                    Choose a student or enable “Assign to all”.
                                </p>
                            ) : null}
                        </div>

                        {/* keep registered */}
                        <input type="hidden" {...register("assignAll")} />
                    </CardContent>
                </Card>

                {/* in case user presses Enter */}
                <button type="submit" className="hidden" />
            </form>
        </CreateView>
    );
}
