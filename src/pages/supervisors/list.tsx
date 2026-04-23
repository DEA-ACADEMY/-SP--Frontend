import { useMemo } from "react";
import { Link } from "react-router-dom";

import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useTable } from "@refinedev/react-table";
import type { HttpError } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

type Supervisor = {
    id: string;
    name: string | null;
    email: string;
};

export default function Supervisors() {
    const { t } = useTranslation();

    const columns = useMemo<ColumnDef<Supervisor>[]>(() => {
        return [
            {
                accessorKey: "name",
                header: t("common.name"),
            },
            {
                accessorKey: "email",
                header: t("common.email"),
            },
            {
                id: "actions",
                header: t("students.table.actions"),
                cell: ({ row }) => {
                    const supervisor = row.original;

                    return (
                        <Link
                            to={`/supervisors/${supervisor.id}/profile`}
                            className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                        >
                            {t("students.table.openProfile")}
                        </Link>
                    );
                },
            },
        ];
    }, [t]);

    const table = useTable<Supervisor, HttpError>({
        columns,
        refineCoreProps: {
            resource: "supervisors",
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
