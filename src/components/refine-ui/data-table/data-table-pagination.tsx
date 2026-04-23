"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";

type DataTablePaginationProps = {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  total?: number;
};

export function DataTablePagination({
  currentPage,
  pageCount,
  setCurrentPage,
  pageSize,
  setPageSize,
  total,
}: DataTablePaginationProps) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const safePageCount = Math.max(1, pageCount || Math.ceil((total ?? 0) / pageSize) || 1);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= safePageCount;
  const pageSizeOptions = useMemo(() => {
    const baseOptions = [10, 20, 30, 40, 50];
    const optionsSet = new Set(baseOptions);

    if (!optionsSet.has(pageSize)) {
      optionsSet.add(pageSize);
    }

    return Array.from(optionsSet).sort((a, b) => a - b);
  }, [pageSize]);

  return (
    <div
      className={cn(
        "flex",
        "items-center",
        "justify-between",
        "flex-wrap",
        "px-2",
        "w-full",
        "gap-2"
      )}
    >
      <div
        className={cn(
          "flex-1",
          "text-sm",
          "text-muted-foreground",
          "whitespace-nowrap"
        )}
      >
        {typeof total === "number" ? t("table.pagination.rows", { count: total }) : null}
      </div>
      <div className={cn("flex", "items-center", "flex-wrap", "gap-2", dir === "rtl" && "flex-row-reverse")}>
        <div className={cn("flex", "items-center", "gap-2", dir === "rtl" && "flex-row-reverse")}>
          <span className={cn("text-sm", "font-medium")}>{t("table.pagination.rowsPerPage")}</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className={cn("h-8", "w-[70px]")}>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={cn("flex", "items-center", "flex-wrap", "gap-2", dir === "rtl" && "flex-row-reverse")}>
          <div
            className={cn(
              "flex",
              "items-center",
              "justify-center",
              "text-sm",
              "font-medium"
            )}
          >
            {t("table.pagination.pageOf", { page: currentPage, pageCount: safePageCount })}
          </div>
          <div className={cn("flex", "items-center", "gap-2", dir === "rtl" && "flex-row-reverse")}>
            <Button
              variant="outline"
              className={cn("hidden", "h-8", "w-8", "p-0", "lg:flex")}
              onClick={() => setCurrentPage(1)}
              disabled={isFirstPage}
              aria-label={t("table.pagination.firstPage")}
            >
              {dir === "rtl" ? <ChevronsRight /> : <ChevronsLeft />}
            </Button>
            <Button
              variant="outline"
              className={cn("h-8", "w-8", "p-0")}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={isFirstPage}
              aria-label={t("table.pagination.previousPage")}
            >
              {dir === "rtl" ? <ChevronRight /> : <ChevronLeft />}
            </Button>
            <Button
              variant="outline"
              className={cn("h-8", "w-8", "p-0")}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={isLastPage}
              aria-label={t("table.pagination.nextPage")}
            >
              {dir === "rtl" ? <ChevronLeft /> : <ChevronRight />}
            </Button>
            <Button
              variant="outline"
              className={cn("hidden", "h-8", "w-8", "p-0", "lg:flex")}
              onClick={() => setCurrentPage(safePageCount)}
              disabled={isLastPage}
              aria-label={t("table.pagination.lastPage")}
            >
              {dir === "rtl" ? <ChevronsLeft /> : <ChevronsRight />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

DataTablePagination.displayName = "DataTablePagination";
