import { useMemo } from "react";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view";
import type { HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

type ManagementUser = {
    id: string;
    name: string | null;
    email: string;
};

export default function Managements() {
    const { t } = useTranslation();

    const columns = useMemo<ColumnDef<ManagementUser>[]>(() => {
        return [
            {
                accessorKey: "name",
                header: t("common.name"),
            },
            {
                accessorKey: "email",
                header: t("common.email"),
            },
        ];
    }, [t]);

    const table = useTable<ManagementUser, HttpError>({
        columns,
        refineCoreProps: {
            resource: "managements",
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
