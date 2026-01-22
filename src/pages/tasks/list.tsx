import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

import { useTable } from "@refinedev/react-table";
import type { HttpError } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";


type Task = {
    id: string;
    title: string;
    dueDate: string;
    status: "new" | "in_progress" | "submitted" | "reviewed" | "completed";
    priority: "low" | "medium" | "high";
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
                accessorKey: "priority",
                header: "Priority",
                cell: ({ getValue }) => {
                    const v = getValue<string>();
                    return (
                        <Badge variant={v === "high" ? "destructive" : "secondary"}>
                            {v}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => (
                    <Badge variant="outline">{getValue<string>()}</Badge>
                ),
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
