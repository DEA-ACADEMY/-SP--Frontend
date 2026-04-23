import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

import { useTable } from "@refinedev/react-table";
import type { HttpError } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { kyInstance } from "@/providers/data";
import { authProvider } from "@/providers/auth";
import type { Role } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";

type Student = {
    id: string;
    name: string | null;
    email: string;
    supervisorId: string | null;
};

type Supervisor = {
    id: string;
    name: string | null;
    email: string;
};

type StudentCreateRequest = {
    id: string;
    name: string;
    email: string;
    status: "pending" | "approved" | "rejected";
    branchId: string;
    programId: string;
    cohortId: string;
    createdAt: string;
    requestedBySupervisorId: string;
    supervisorName: string | null;
    supervisorEmail: string;
};

export default function Students() {
    const { t } = useTranslation();
    const { dir } = useLanguage();
    const [role, setRole] = useState<Role | null>(null);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [override, setOverride] = useState<Record<string, string | null>>({});
    const [error, setError] = useState<string | null>(null);

    const [requests, setRequests] = useState<StudentCreateRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsActionLoading, setRequestsActionLoading] = useState<Record<string, boolean>>(
        {},
    );
    const [approvedPassword, setApprovedPassword] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const nextRole = (await authProvider.getPermissions?.()) as Role | null;
                if (!cancelled) setRole(nextRole ?? null);

                if (nextRole === "management") {
                    const [supervisorsJson, requestsJson] = await Promise.all([
                        kyInstance.get("supervisors").json<any>(),
                        kyInstance.get("students/create-requests").json<any>(),
                    ]);

                    const supervisorsData = Array.isArray(supervisorsJson)
                        ? supervisorsJson
                        : supervisorsJson?.data ?? [];

                    const requestsData = Array.isArray(requestsJson)
                        ? requestsJson
                        : requestsJson?.data ?? [];

                    if (!cancelled) {
                        setSupervisors(supervisorsData);
                        setRequests(requestsData);
                    }

                    return;
                }

                if (!cancelled) {
                    setSupervisors([]);
                    setRequests([]);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setSupervisors([]);
                    setRequests([]);
                    setError(t("students.messages.failedToLoadPage"));
                }
            } finally {
                if (!cancelled) setRequestsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [t]);

    async function refreshRequests() {
        try {
            setRequestsLoading(true);
            const json: any = await kyInstance.get("students/create-requests").json();
            const data = Array.isArray(json) ? json : json?.data ?? [];
            setRequests(data);
        } catch {
            setError(t("students.messages.failedToRefreshRequests"));
        } finally {
            setRequestsLoading(false);
        }
    }

    async function setStudentSupervisor(studentId: string, supervisorId: string | null) {
        await kyInstance.put(`students/${studentId}/supervisor`, {
            json: { supervisorId },
        });
    }

    async function approveRequest(requestId: string) {
        setError(null);
        setApprovedPassword(null);
        setRequestsActionLoading((prev) => ({ ...prev, [requestId]: true }));

        try {
            const res: any = await kyInstance
                .post(`students/create-requests/${requestId}/approve`)
                .json();
            setApprovedPassword(res?.temporaryPassword ?? null);
            await refreshRequests();
            window.location.reload();
        } catch (e: any) {
            setError(e?.message ?? t("students.messages.failedToApproveRequest"));
        } finally {
            setRequestsActionLoading((prev) => ({ ...prev, [requestId]: false }));
        }
    }

    async function rejectRequest(requestId: string) {
        setError(null);
        setRequestsActionLoading((prev) => ({ ...prev, [requestId]: true }));

        try {
            await kyInstance.post(`students/create-requests/${requestId}/reject`, {
                json: {},
            });
            await refreshRequests();
        } catch (e: any) {
            setError(e?.message ?? t("students.messages.failedToRejectRequest"));
        } finally {
            setRequestsActionLoading((prev) => ({ ...prev, [requestId]: false }));
        }
    }

    const columns = useMemo<ColumnDef<Student>[]>(() => {
        return [
            { accessorKey: "name", header: t("students.table.name") },
            { accessorKey: "email", header: t("students.table.email") },
            {
                id: "supervisor",
                header: t("students.table.supervisor"),
                cell: ({ row }) => {
                    const student = row.original;

                    if (role !== "management") {
                        return (
                            <span className="text-sm text-muted-foreground">
                                {student.supervisorId
                                    ? t("students.table.assigned")
                                    : t("students.table.unassigned")}
                            </span>
                        );
                    }

                    const current = override[student.id] ?? student.supervisorId;
                    const value = current ?? "none";
                    const isSaving = !!saving[student.id];

                    return (
                        <div className="flex items-center gap-2">
                            <Select
                                value={value}
                                disabled={isSaving}
                                onValueChange={async (v) => {
                                    const next = v === "none" ? null : v;

                                    setError(null);
                                    setOverride((prev) => ({ ...prev, [student.id]: next }));
                                    setSaving((prev) => ({ ...prev, [student.id]: true }));

                                    try {
                                        await setStudentSupervisor(student.id, next);
                                    } catch (e: any) {
                                        setOverride((prev) => {
                                            const copy = { ...prev };
                                            delete copy[student.id];
                                            return copy;
                                        });

                                        const status = e?.response?.status;
                                        if (status === 401) setError(t("students.messages.unauthorized"));
                                        else if (status === 403) {
                                            setError(t("students.messages.forbidden"));
                                        } else {
                                            setError(t("students.messages.failedToUpdateSupervisor"));
                                        }
                                    } finally {
                                        setSaving((prev) => ({ ...prev, [student.id]: false }));
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full min-w-[180px] max-w-[240px]">
                                    <SelectValue placeholder={t("students.table.assignSupervisor")} />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="none">
                                        {t("students.table.unassignedOption")}
                                    </SelectItem>
                                    {supervisors.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name ?? s.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {isSaving ? (
                                <span className="text-xs text-muted-foreground">
                                    {t("students.messages.saving")}
                                </span>
                            ) : null}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: t("students.table.actions"),
                cell: ({ row }) => {
                    const student = row.original;

                    return (
                        <Link
                            to={`/students/${student.id}/profile`}
                            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                        >
                            {t("students.table.openProfile")}
                        </Link>
                    );
                },
            },
        ];
    }, [role, supervisors, saving, override, t]);

    const table = useTable<Student, HttpError>({
        columns,
        refineCoreProps: {
            resource: "students",
            pagination: { pageSize: 10 },
        },
    });

    const pendingRequests = requests.filter((r) => r.status === "pending");

    return (
        <ListView>
            <ListViewHeader title={t("students.titles.list")} />

            {error ? <div className="text-sm text-destructive">{error}</div> : null}

            {approvedPassword ? (
                <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
                    {t("students.messages.temporaryPassword")}{" "}
                    <span className="font-semibold">{approvedPassword}</span>
                </div>
            ) : null}

            {role === "management" ? (
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className={dir === "rtl" ? "text-right" : "text-left"}>
                                {t("students.requests.pendingTitle")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {requestsLoading ? (
                                <div
                                    className={cn(
                                        "text-sm text-muted-foreground",
                                        dir === "rtl" ? "text-right" : "text-left",
                                    )}
                                >
                                    {t("students.requests.loading")}
                                </div>
                            ) : pendingRequests.length === 0 ? (
                                <div
                                    className={cn(
                                        "text-sm text-muted-foreground",
                                        dir === "rtl" ? "text-right" : "text-left",
                                    )}
                                >
                                    {t("students.requests.empty")}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((request) => {
                                        const busy = !!requestsActionLoading[request.id];

                                        return (
                                            <div
                                                key={request.id}
                                                className={cn(
                                                    "flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between",
                                                    dir === "rtl" && "md:flex-row-reverse",
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "space-y-1",
                                                        dir === "rtl" ? "text-right" : "text-left",
                                                    )}
                                                >
                                                    <div className="font-medium">{request.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {request.email}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {t("students.requests.supervisor")}: {" "}
                                                        {request.supervisorName ?? request.supervisorEmail}
                                                    </div>
                                                </div>

                                                <div
                                                    className={cn(
                                                        "flex flex-wrap gap-2",
                                                        dir === "rtl" && "justify-start",
                                                    )}
                                                >
                                                    <Button
                                                        size="sm"
                                                        disabled={busy}
                                                        onClick={() => approveRequest(request.id)}
                                                    >
                                                        {busy
                                                            ? t("students.requests.working")
                                                            : t("students.requests.approve")}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={busy}
                                                        onClick={() => rejectRequest(request.id)}
                                                    >
                                                        {t("students.requests.reject")}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : null}

            <DataTable table={table} />
        </ListView>
    );
}
