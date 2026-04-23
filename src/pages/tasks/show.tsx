import { useEffect, useMemo, useState } from "react";
import { ShowView } from "@/components/refine-ui/views/show-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    CloudinaryDocumentUpload,
    getCloudinaryDownloadUrl,
    getDocumentFileName,
} from "@/components/document-upload-widget";

import { useShow } from "@refinedev/core";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { kyInstance } from "@/providers/data";
import { useTranslation } from "react-i18next";
import i18n from "@/language/i18n";

type TaskStatus =
    | "new"
    | "in_progress"
    | "submitted"
    | "needs_resubmission"
    | "completed";

type SubmissionDecision =
    | "pending"
    | "accepted"
    | "rejected"
    | "needs_resubmission";

type Task = {
    id: string;
    title: string;
    description?: string | null;
    documentUrl?: string | null;
    dueDate?: string | null;
    createdBy?: string | null;
    status?: TaskStatus;
    assignedByName?: string | null;
    assignedByEmail?: string | null;
    assignees?: {
        studentId: string;
        name: string | null;
        email: string;
        status: TaskStatus;
    }[];
};

type Submission = {
    id: string;
    taskId: string;
    studentId: string;
    bodyText?: string | null;
    linkUrl?: string | null;
    fileUrl?: string | null;
    submittedAt: string;
    reviewedBy?: string | null;
    decision: SubmissionDecision;
    feedback?: string | null;
    reviewedAt?: string | null;
};

function StatusBadge({ status }: { status?: TaskStatus }) {
    if (!status) return <Badge variant="outline">—</Badge>;
    return <Badge variant="outline">{i18n.t(`tasks.status.${status}`)}</Badge>;
}

function DecisionBadge({ decision }: { decision?: SubmissionDecision }) {
    if (!decision) return <Badge variant="outline">—</Badge>;
    return <Badge variant="outline">{i18n.t(`tasks.decision.${decision}`)}</Badge>;
}

function formatDateTime(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
}

function DocumentActions({ url }: { url?: string | null }) {
    if (!url) return <div className="text-sm">—</div>;

    const downloadUrl = getCloudinaryDownloadUrl(url);
    const fileName = getDocumentFileName(url);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="max-w-full truncate rounded-md border px-3 py-1.5 text-sm underline"
                title={fileName || url}
            >
                {tSafeOpenDocument()}
            </a>
            <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                download={fileName || undefined}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
                {tSafeDownload()}
            </a>
        </div>
    );
}

function tSafeOpenDocument() {
    return i18n.t("tasks.fields.openDocument");
}

function tSafeDownload() {
    return i18n.t("tasks.fields.downloadDocument");
}

export default function TaskShow() {
    const { t } = useTranslation();
    const { id } = useParams();
    const { query } = useShow<Task>({ resource: "tasks", id: id! });

    const isLoading = query.isLoading;
    const isError = query.isError;
    const task = query.data?.data;

    const isStudentView = Boolean(task?.status);
    const assignees = task?.assignees ?? [];

    const [studentSubmission, setStudentSubmission] = useState<Submission | null>(null);
    const [staffSubmissions, setStaffSubmissions] = useState<Record<string, Submission | null>>(
        {},
    );

    const [submissionForm, setSubmissionForm] = useState({
        bodyText: "",
        linkUrl: "",
        fileUrl: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

    const [reviewLoadingById, setReviewLoadingById] = useState<Record<string, boolean>>({});
    const [reviewErrorById, setReviewErrorById] = useState<Record<string, string | null>>({});
    const [reviewFeedbackById, setReviewFeedbackById] = useState<Record<string, string>>({});

    const [expandedSubmissionByStudent, setExpandedSubmissionByStudent] = useState<
        Record<string, boolean>
    >({});

    const canSubmit = useMemo(() => {
        return (
            isStudentView &&
            task?.status !== "submitted" &&
            task?.status !== "completed"
        );
    }, [isStudentView, task?.status]);

    async function loadStudentSubmission(taskId: string) {
        setLoadingSubmissions(true);
        setSubmissionError(null);

        try {
            const rows = await kyInstance
                .get("task-submissions", {
                    searchParams: { taskId },
                })
                .json<Submission[]>();

            setStudentSubmission(rows[0] ?? null);
        } catch (e: any) {
            setSubmissionError(e?.message ?? t("tasks.messages.failedToLoadSubmission"));
            setStudentSubmission(null);
        } finally {
            setLoadingSubmissions(false);
        }
    }

    async function loadStaffSubmissions(taskId: string, studentIds: string[]) {
        setLoadingSubmissions(true);

        try {
            const results = await Promise.all(
                studentIds.map(async (studentId) => {
                    try {
                        const rows = await kyInstance
                            .get("task-submissions", {
                                searchParams: { taskId, studentId },
                            })
                            .json<Submission[]>();

                        return [studentId, rows[0] ?? null] as const;
                    } catch {
                        return [studentId, null] as const;
                    }
                }),
            );

            const nextMap: Record<string, Submission | null> = {};
            for (const [studentId, submission] of results) {
                nextMap[studentId] = submission;
            }

            setStaffSubmissions(nextMap);
        } finally {
            setLoadingSubmissions(false);
        }
    }

    async function refreshSubmissions() {
        if (!task?.id) return;

        if (isStudentView) {
            await loadStudentSubmission(task.id);
            await query.refetch();
            return;
        }

        await loadStaffSubmissions(
            task.id,
            assignees.map((a) => a.studentId),
        );
        await query.refetch();
    }

    useEffect(() => {
        if (!task?.id) return;

        if (isStudentView) {
            void loadStudentSubmission(task.id);
            return;
        }

        if (assignees.length > 0) {
            void loadStaffSubmissions(
                task.id,
                assignees.map((a) => a.studentId),
            );
        } else {
            setStaffSubmissions({});
        }
    }, [task?.id, isStudentView, assignees.length]);

    async function handleSubmitWork(e: React.FormEvent) {
        e.preventDefault();

        if (!task?.id) return;

        setSubmitting(true);
        setSubmissionError(null);
        setSubmissionSuccess(null);

        try {
            await kyInstance.post("task-submissions", {
                json: {
                    taskId: task.id,
                    bodyText: submissionForm.bodyText,
                    linkUrl: "",
                    fileUrl: submissionForm.fileUrl,
                },
            });

            setSubmissionSuccess(t("tasks.messages.submittedSuccessfully"));
            setSubmissionForm({
                bodyText: "",
                linkUrl: "",
                fileUrl: "",
            });

            await refreshSubmissions();
        } catch (e: any) {
            setSubmissionError(e?.message ?? t("tasks.messages.failedToSubmit"));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleReview(
        submissionId: string,
        decision: "approve" | "needs_resubmission",
        studentId: string,
    ) {
        setReviewLoadingById((prev) => ({ ...prev, [submissionId]: true }));
        setReviewErrorById((prev) => ({ ...prev, [submissionId]: null }));

        try {
            await kyInstance.patch(`task-submissions/${submissionId}/review`, {
                json: {
                    decision,
                    feedback: reviewFeedbackById[submissionId] ?? "",
                },
            });

            await refreshSubmissions();

            const latest = staffSubmissions[studentId];
            if (latest?.id === submissionId) {
                setReviewFeedbackById((prev) => ({
                    ...prev,
                    [submissionId]: "",
                }));
            }
        } catch (e: any) {
            setReviewErrorById((prev) => ({
                ...prev,
                [submissionId]: e?.message ?? t("tasks.messages.failedToReview"),
            }));
        } finally {
            setReviewLoadingById((prev) => ({ ...prev, [submissionId]: false }));
        }
    }

    return (
        <ShowView>
            <div className="flex flex-col gap-6 mb-2">
                <div className="relative flex items-center gap-2">
                    <div className={i18n.dir() === "rtl" ? "bg-background z-[2] pl-4" : "bg-background z-[2] pr-4"}>
                        <Breadcrumb />
                    </div>
                    <Separator className="absolute left-0 right-0 z-[1]" />
                </div>

                <div className="flex items-center justify-between gap-4 pb-2">
                    <h2 className="text-2xl font-bold">{t("tasks.titles.show")}</h2>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link to="/tasks">{t("common.back")}</Link>
                        </Button>

                        {!isStudentView && id ? (
                            <Button asChild>
                                <Link to={`/tasks/edit/${id}`}>{t("buttons.edit")}</Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("tasks.messages.loadingTask")}
                </div>
            ) : isError ? (
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        {t("tasks.messages.failedToLoadThis")}
                    </CardContent>
                </Card>
            ) : !task ? (
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        {t("tasks.messages.notFound")}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{t("tasks.sections.overview")}</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">{t("tasks.fields.title")}</div>
                                    <div className="text-lg font-semibold">{task.title}</div>
                                </div>

                                <Separator />

                                <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">{t("tasks.fields.description")}</div>
                                    <div className="text-sm">
                                        {task.description?.trim() ? task.description : "—"}
                                    </div>
                                </div>

                                {task.documentUrl ? (
                                    <>
                                        <Separator />
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">{t("tasks.fields.taskDocument")}</div>
                                            <DocumentActions url={task.documentUrl} />
                                        </div>
                                    </>
                                ) : null}

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">{t("tasks.fields.dueDate")}</div>
                                        <div className="text-sm font-medium">
                                            {formatDateTime(task.dueDate)}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">{t("tasks.fields.assignedBy")}</div>
                                        <div className="text-sm font-medium">
                                            {task.assignedByName?.trim()
                                                ? task.assignedByName
                                                : task.assignedByEmail?.trim()
                                                    ? task.assignedByEmail
                                                    : task.createdBy ?? "—"}
                                        </div>
                                    </div>
                                </div>

                                {!isStudentView ? (
                                    <>
                                        <Separator />

                                        <div className="space-y-3">
                                            <div className="text-sm text-muted-foreground">
                                                {t("tasks.fields.assignees")}
                                            </div>

                                            {assignees.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">
                                                    {t("tasks.messages.noAssignees")}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {assignees.map((assignee) => {

                                                        const latestSubmission =
                                                            staffSubmissions[assignee.studentId] ?? null;

                                                        const reviewKey = latestSubmission?.id ?? assignee.studentId;
                                                        const reviewValue =
                                                            latestSubmission?.id
                                                                ? reviewFeedbackById[latestSubmission.id] ?? ""
                                                                : "";

                                                        const isExpanded =
                                                            expandedSubmissionByStudent[assignee.studentId] ?? false;


                                                        return (
                                                            <div
                                                                key={assignee.studentId}
                                                                className="rounded-md border p-4 space-y-4"
                                                            >
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {assignee.name ?? assignee.email}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {assignee.email}
                                                                        </div>
                                                                    </div>

                                                                    <StatusBadge status={assignee.status} />
                                                                </div>

                                                                <Separator />

                                                                {!latestSubmission ? (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {t("tasks.messages.noSubmissionYet")}
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-4">
                                                                        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                                                            <div className="grid gap-4 sm:grid-cols-2">
                                                                                <div className="space-y-1">
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        {t("tasks.fields.submittedAt")}
                                                                                    </div>
                                                                                    <div className="text-sm font-medium">
                                                                                        {formatDateTime(latestSubmission.submittedAt)}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="space-y-1">
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        {t("tasks.fields.reviewStatus")}
                                                                                    </div>
                                                                                    <div>
                                                                                        <DecisionBadge decision={latestSubmission.decision} />
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex sm:justify-end">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        setExpandedSubmissionByStudent((prev) => ({
                                                                                            ...prev,
                                                                                            [assignee.studentId]: !isExpanded,
                                                                                        }))
                                                                                    }
                                                                                >
                                                                                    {isExpanded ? (
                                                                                        <>
                                                                                            <ChevronDown className="h-4 w-4" />
                                                                                            {t("tasks.actions.showLess")}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <ChevronRight className="h-4 w-4" />
                                                                                            {t("tasks.actions.showMore")}
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        {isExpanded ? (
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-1">
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        Submission text
                                                                                    </div>
                                                                                    <div className="text-sm whitespace-pre-wrap">
                                                                                        {latestSubmission.bodyText?.trim()
                                                                                            ? latestSubmission.bodyText
                                                                                            : "—"}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid gap-4 sm:grid-cols-2">
                                                                                <div className="space-y-1">
                                                                                    <div className="text-xs text-muted-foreground">{t("tasks.fields.submissionDocument")}</div>
                                                                                    <DocumentActions url={latestSubmission.fileUrl || latestSubmission.linkUrl} />
                                                                                </div>
                                                                                </div>

                                                                                <div className="space-y-1">
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        {t("tasks.fields.existingFeedback")}
                                                                                    </div>
                                                                                    <div className="text-sm whitespace-pre-wrap">
                                                                                        {latestSubmission.feedback?.trim()
                                                                                            ? latestSubmission.feedback
                                                                                            : "—"}
                                                                                    </div>
                                                                                </div>

                                                                                {latestSubmission.decision === "pending" ? (
                                                                                    <div className="space-y-3">
                                                                                        <div className="space-y-2">
                                                                                            <label className="text-sm font-medium">
                                                                                                {t("tasks.fields.feedback")}
                                                                                            </label>
                                                                                            <Textarea
                                                                                                rows={4}
                                                                                                placeholder={t("tasks.placeholders.feedback")}
                                                                                                value={reviewValue}
                                                                                                onChange={(e) =>
                                                                                                    setReviewFeedbackById((prev) => ({
                                                                                                        ...prev,
                                                                                                        [latestSubmission.id]: e.target.value,
                                                                                                    }))
                                                                                                }
                                                                                            />
                                                                                        </div>

                                                                                        {reviewErrorById[reviewKey] ? (
                                                                                            <div className="text-sm text-destructive">
                                                                                                {reviewErrorById[reviewKey]}
                                                                                            </div>
                                                                                        ) : null}

                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            <Button
                                                                                                onClick={() =>
                                                                                                    handleReview(
                                                                                                        latestSubmission.id,
                                                                                                        "approve",
                                                                                                        assignee.studentId,
                                                                                                    )
                                                                                                }
                                                                                                disabled={reviewLoadingById[latestSubmission.id]}
                                                                                            >
                                                                                                {reviewLoadingById[latestSubmission.id] ? (
                                                                                                    <>
                                                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                                        Saving...
                                                                                                    </>
                                                                                                ) : (
                                                                                            t("tasks.actions.approve")
                                                                                                )}
                                                                                            </Button>

                                                                                            <Button
                                                                                                variant="outline"
                                                                                                onClick={() =>
                                                                                                    handleReview(
                                                                                                        latestSubmission.id,
                                                                                                        "needs_resubmission",
                                                                                                        assignee.studentId,
                                                                                                    )
                                                                                                }
                                                                                                disabled={reviewLoadingById[latestSubmission.id]}
                                                                                            >
                                                                                                {t("tasks.actions.needsResubmission")}
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                                                        <div className="space-y-1">
                                                                                            <div className="text-xs text-muted-foreground">
                                                                                                {t("tasks.fields.reviewedAt")}
                                                                                            </div>
                                                                                            <div className="text-sm font-medium">
                                                                                                {formatDateTime(latestSubmission.reviewedAt)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : null}
                            </CardContent>
                        </Card>

                        {isStudentView ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">{t("tasks.sections.submitWork")}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {!canSubmit ? (
                                            <div className="text-sm text-muted-foreground">
                                                {t("tasks.messages.cannotSubmit")}
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmitWork} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        {t("tasks.fields.submissionText")}
                                                    </label>
                                                    <Textarea
                                                        rows={6}
                                                        placeholder={t("tasks.placeholders.answer")}
                                                        value={submissionForm.bodyText}
                                                        onChange={(e) =>
                                                            setSubmissionForm((prev) => ({
                                                                ...prev,
                                                                bodyText: e.target.value,
                                                            }))
                                                        }
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">
                                                        {t("tasks.fields.submissionDocument")}
                                                    </label>
                                                    <CloudinaryDocumentUpload
                                                        value={submissionForm.fileUrl}
                                                        onChange={(url) =>
                                                            setSubmissionForm((prev) => ({
                                                                ...prev,
                                                                fileUrl: url,
                                                            }))
                                                        }
                                                        folder="snowball/tasks/submissions"
                                                        disabled={submitting}
                                                    />
                                                </div>

                                                {submissionError ? (
                                                    <div className="text-sm text-destructive">
                                                        {submissionError}
                                                    </div>
                                                ) : null}

                                                {submissionSuccess ? (
                                                    <div className="text-sm text-primary">
                                                        {submissionSuccess}
                                                    </div>
                                                ) : null}

                                                <div className="flex justify-end">
                                                    <Button type="submit" disabled={submitting}>
                                                        {submitting ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                {t("common.submitting")}
                                                            </>
                                                        ) : (
                                                            t("tasks.actions.submitWork")
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">{t("tasks.sections.latestSubmission")}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {loadingSubmissions ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t("tasks.messages.loadingSubmission")}
                                            </div>
                                        ) : !studentSubmission ? (
                                            <div className="text-sm text-muted-foreground">
                                                {t("tasks.messages.noSubmissionYet")}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground">
                                                            {t("tasks.fields.submittedAt")}
                                                        </div>
                                                        <div className="font-medium text-sm">
                                                            {formatDateTime(studentSubmission.submittedAt)}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground">
                                                            {t("tasks.fields.reviewStatus")}
                                                        </div>
                                                        <div>
                                                            <DecisionBadge
                                                                decision={studentSubmission.decision}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">
                                                        {t("tasks.fields.submissionText")}
                                                    </div>
                                                    <div className="text-sm whitespace-pre-wrap">
                                                        {studentSubmission.bodyText?.trim()
                                                            ? studentSubmission.bodyText
                                                            : "—"}
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground">
                                                            {t("tasks.fields.submissionDocument")}
                                                        </div>
                                                        <DocumentActions url={studentSubmission.fileUrl || studentSubmission.linkUrl} />
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">
                                                        {t("tasks.fields.supervisorFeedback")}
                                                    </div>
                                                    <div className="text-sm whitespace-pre-wrap">
                                                        {studentSubmission.feedback?.trim()
                                                            ? studentSubmission.feedback
                                                            : "—"}
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-muted-foreground">
                                                            {t("tasks.fields.reviewedAt")}
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            {formatDateTime(studentSubmission.reviewedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}
                    </div>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">{t("common.meta")}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm">
                            {isStudentView ? (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{t("common.status")}</span>
                                    <StatusBadge status={task.status} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">{t("tasks.fields.assigned")}</span>
                                    <Badge variant="outline">{assignees.length}</Badge>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">{t("tasks.fields.dueDate")}</span>
                                <span className="font-medium">{task.dueDate ?? "—"}</span>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            )}
        </ShowView>
    );
}
