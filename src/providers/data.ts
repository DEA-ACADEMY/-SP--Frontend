import { createDataProvider } from "@refinedev/rest";
import { API_URL } from "./constants";

export const { dataProvider, kyInstance } = createDataProvider(
    API_URL,
    {
      getList: {
        async buildQueryParams(params) {
          const query: Record<string, any> = {
            ...(params.meta?.query ?? {}),
          };

          const pagination = params.pagination as
            | { current?: number; currentPage?: number; pageSize?: number; mode?: string }
            | undefined;

          if (pagination?.mode === "off") {
            query._start = 0;
            query._end = 1000;
          } else {
            const current = pagination?.currentPage ?? pagination?.current ?? 1;
            const pageSize = pagination?.pageSize ?? 10;
            query._start = (current - 1) * pageSize;
            query._end = current * pageSize;
          }

          const sorter = params.sorters?.[0];
          if (sorter?.field) {
            query._sort = sorter.field;
            query._order = sorter.order === "asc" ? "ASC" : "DESC";
          }

          for (const filter of params.filters ?? []) {
            if ("field" in filter && filter.field === "q" && filter.value) {
              query.q = filter.value;
            }
          }

          return query;
        },
        async getTotalCount(response) {
          const headerValue = response.headers.get("x-total-count");
          const parsed = Number(headerValue);
          return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
        },
      },
    },
    {
      credentials: "include", // ✅ sends cookies
    },
);
