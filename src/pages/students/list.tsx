import { useEffect, useMemo, useState } from "react";

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

type Student = {
    id: string;
    name: string | null;
    email: string;

    // MUST come from backend (recommended)
    supervisorId: string | null;
};

type Supervisor = {
    id: string;
    name: string | null;
    email: string;
};

export default function Students() {
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const [override, setOverride] = useState<Record<string, string | null>>({});
    const [error, setError] = useState<string | null>(null);

    // Load supervisors for dropdown
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const json: any = await kyInstance.get("supervisors").json();
                const data = Array.isArray(json) ? json : json?.data ?? [];
                if (!cancelled) setSupervisors(data);
            } catch (e: any) {
                if (!cancelled) {
                    setSupervisors([]);
                    setError("Failed to load supervisors list");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    async function setStudentSupervisor(studentId: string, supervisorId: string | null) {
        await kyInstance.put(`students/${studentId}/supervisor`, {
            json: { supervisorId },
        });
    }

    const columns = useMemo<ColumnDef<Student>[]>(() => {
        return [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "email", header: "Email" },
            {
                id: "supervisor",
                header: "Supervisor",
                cell: ({ row }) => {
                    const student = row.original;

                    // Use override if user changed it, otherwise backend value
                    const current = override[student.id] ?? student.supervisorId;
                    const value = current ?? "none";
                    const isSaving = !!saving[student.id];
                    return (
                        <div className="flex items-center gap-2 justify-center">
                            <Select
                                value={value}
                                disabled={isSaving}
                                onValueChange={async (v) => {
                                    const next = v === "none" ? null : v;

                                    // optimistic update
                                    setError(null);
                                    setOverride((prev) => ({ ...prev, [student.id]: next }));
                                    setSaving((prev) => ({ ...prev, [student.id]: true }));

                                    try {
                                        await setStudentSupervisor(student.id, next);
                                    } catch (e: any) {
                                        // rollback override (back to backend value)
                                        setOverride((prev) => {
                                            const copy = { ...prev };
                                            delete copy[student.id];
                                            return copy;
                                        });

                                        const status = e?.response?.status;
                                        if (status === 401) setError("Unauthorized (login required)");
                                        else if (status === 403) setError("Forbidden (management only)");
                                        else setError("Failed to update supervisor mapping");
                                    } finally {
                                        setSaving((prev) => ({ ...prev, [student.id]: false }));
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Assign supervisor" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="none">— Unassigned —</SelectItem>
                                    {supervisors.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name ?? s.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {isSaving ? (
                                <span className="text-xs text-muted-foreground">Saving…</span>
                            ) : null}
                        </div>
                    );
                },
            },
        ];
    }, [supervisors, saving, override]);

    const table = useTable<Student, HttpError>({
        columns,
        refineCoreProps: {
            resource: "students",
            pagination: { pageSize: 10 },
        },
    });

    return (
        <ListView>
            <ListViewHeader />

            {error ? (
                <div className="px-6 pb-2 text-sm text-destructive">{error}</div>
            ) : null}

            <DataTable table={table} />
        </ListView>
    );
}