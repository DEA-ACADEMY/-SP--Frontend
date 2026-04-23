"use client";

import type { PropsWithChildren } from "react";

import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { useResourceParams, useUserFriendlyName } from "@refinedev/core";
import { useTranslation } from "react-i18next";

type ListViewProps = PropsWithChildren<{
  className?: string;
}>;

export function ListView({ children, className }: ListViewProps) {
  return (
      <div className={cn("mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-6 p-4 md:p-6", className)}>
        {children}
      </div>
  );
}

type ListHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  canCreate?: boolean;
  headerClassName?: string;
  wrapperClassName?: string;
}>;

export const ListViewHeader = ({
                                 canCreate,
                                 resource: resourceFromProps,
                                 title: titleFromProps,
                                 wrapperClassName,
                                 headerClassName,
                               }: ListHeaderProps) => {
  const { t, i18n } = useTranslation();
  const getUserFriendlyName = useUserFriendlyName();
  const { dir } = useLanguage();

  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });

  const resourceName = identifier ?? resource?.name;
  const isCreateButtonVisible = canCreate ?? !!resource?.create;
  const translateMaybe = (value?: string) => {
    if (!value) return "";
    const normalized = value.charAt(0).toLowerCase() + value.slice(1);
    if (i18n.exists(value)) return t(value);
    if (i18n.exists(normalized)) return t(normalized);
    return value;
  };

  const rawResourceLabel = resource?.meta?.label;
  const title =
      titleFromProps ??
      (rawResourceLabel
          ? translateMaybe(rawResourceLabel)
          : getUserFriendlyName(identifier ?? resource?.name, "plural"));

  return (
      <div className={cn("flex flex-col gap-6 mb-6", wrapperClassName)}>
        <div className="relative flex items-center gap-2">
          <div className={cn("z-[2] bg-background", dir === "rtl" ? "pl-4" : "pr-4")}>
            <Breadcrumb />
          </div>
          <Separator className="absolute left-0 right-0 z-[1]" />
        </div>

        <div
            className={cn(
                "flex w-full flex-wrap items-center justify-between gap-4",
                headerClassName,
            )}
        >
          <h2 className={cn("text-2xl font-bold", dir === "rtl" ? "text-right" : "text-left")}>
            {title}
          </h2>

          {isCreateButtonVisible ? (
              <div className={cn("flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
                <CreateButton resource={resourceName} />
              </div>
          ) : null}
        </div>
      </div>
  );
};

ListView.displayName = "ListView";
