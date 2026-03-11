import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

import { useTable } from "@refinedev/react-table";
import type { HttpError } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

type Task = {
    id: string;
    title: string;
    dueDate: string;

    // student response
    status?: "new" | "in_progress" | "submitted" | "needs_resubmission" | "completed";

    // staff response
    assignees?: {
        studentId: string;
        name: string | null;
        email: string;
        status: "new" | "in_progress" | "submitted" | "needs_resubmission" | "completed";
    }[];
};

export default function TasksList() {
    const table = useTable<Task, HttpError>({
        columns: [
            {
                accessorKey: "title",
                header: "Title",
            },
            {
                accessorKey: "dueDate",
                header: "Due Date",
            },
            {
                id: "assignedTo",
                header: "Assigned To",
                cell: ({ row }) => {
                    const assignees = row.original.assignees ?? [];
                    if (assignees.length === 0) {
                        return <span className="text-muted-foreground">—</span>;
                    }

                    const names = assignees.map((a) => a.name ?? a.email);
                    const first = names.slice(0, 2).join(", ");
                    const more = names.length > 2 ? ` +${names.length - 2}` : "";

                    return <span>{first}{more}</span>;
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row, getValue }) => {
                    // student: status exists directly
                    const v = getValue<string>();
                    if (v) return <Badge variant="outline">{v}</Badge>;

                    // staff: show summary from assignees
                    const assignees = row.original.assignees ?? [];
                    if (assignees.length === 0) {
                        return <span className="text-muted-foreground">—</span>;
                    }

                    const done = assignees.filter((a) => a.status === "completed").length;
                    return <Badge variant="outline">{done}/{assignees.length} completed</Badge>;
                },
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => {
                    const id = row.original.id;

                    return (
                        <div className="flex justify-end gap-2">
                            <ShowButton resource="tasks" recordItemId={id} />
                            <EditButton resource="tasks" recordItemId={id} />
                            <DeleteButton resource="tasks" recordItemId={id} />
                        </div>
                    );
                },
            },
        ] as ColumnDef<Task>[],
        refineCoreProps: {
            resource: "tasks",
            pagination: { pageSize: 10 },
        },
    });

    return (
        <ListView>
            <ListViewHeader />
            <DataTable table={table} />
        </ListView>
    );
}
