"use client";

import { RefreshButton } from "@/components/refine-ui/buttons/refresh";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { useTranslation } from "react-i18next";
import {
  useBack,
  useResourceParams,
  useUserFriendlyName,
} from "@refinedev/core";
import { ArrowLeftIcon } from "lucide-react";
import type { PropsWithChildren } from "react";

type EditViewProps = PropsWithChildren<{
  className?: string;
}>;

export function EditView({ children, className }: EditViewProps) {
  return (
      <div className={cn("mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-6 p-4 md:p-6", className)}>
        {children}
      </div>
  );
}

type EditViewHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  wrapperClassName?: string;
  headerClassName?: string;
  actionsSlot?: React.ReactNode;
}>;

export const EditViewHeader = ({
                                 resource: resourceFromProps,
                                 title: titleFromProps,
                                 actionsSlot,
                                 wrapperClassName,
                                 headerClassName,
                               }: EditViewHeaderProps) => {
  const { t, i18n } = useTranslation();
  const back = useBack();
  const getUserFriendlyName = useUserFriendlyName();
  const { dir } = useLanguage();

  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const { id: recordItemId } = useResourceParams();

  const resourceName = resource?.name ?? identifier;

  const rawTitle =
      titleFromProps ??
      getUserFriendlyName(
          resource?.meta?.label ?? identifier ?? resource?.name,
          "plural",
      );
  const title = i18n.exists(rawTitle) ? t(rawTitle) : rawTitle;

  return (
      <div className={cn("flex flex-col gap-4", wrapperClassName)}>
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={back}>
              <ArrowLeftIcon className={cn("h-4 w-4", dir === "rtl" ? "rotate-180" : "")} />
            </Button>
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {actionsSlot}
            <RefreshButton
                variant="outline"
                recordItemId={recordItemId}
                resource={resourceName}
            />
          </div>
        </div>
      </div>
  );
};

EditView.displayName = "EditView";
