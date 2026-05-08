import { useMemo } from "react";
import { Link } from "react-router-dom";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import type { HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

type Donor = {
    id: string;
    name: string | null;
    email: string;
    supportedStudents: number;
    supportedPrograms: number;
};

export default function Donors() {
    const { t } = useTranslation();

    const columns = useMemo<ColumnDef<Donor>[]>(() => {
        return [
            { accessorKey: "name", header: t("common.name") },
            { accessorKey: "email", header: t("common.email") },
            { accessorKey: "supportedStudents", header: t("donors.fields.supportedStudents") },
            { accessorKey: "supportedPrograms", header: t("donors.fields.supportedPrograms") },
            {
                id: "actions",
                header: t("students.table.actions"),
                cell: ({ row }) => {
                    const donor = row.original;
                    return (
                        <Link
                            to={`/donors/${donor.id}/profile`}
                            className="px-3 py-1.5 rounded-md border hover:bg-muted text-sm"
                        >
                            {t("students.table.openProfile")}
                        </Link>
                    );
                },
            },
        ];
    }, [t]);

    const table = useTable<Donor, HttpError>({
        columns,
        refineCoreProps: {
            resource: "donors",
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
