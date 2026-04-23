"use client";

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

type CreateViewProps = PropsWithChildren<{
  className?: string;
}>;

export function CreateView({ children, className }: CreateViewProps) {
  return (
      <div className={cn("mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-6 p-4 md:p-6", className)}>
        {children}
      </div>
  );
}

type CreateHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  wrapperClassName?: string;
  headerClassName?: string;
}>;

export const CreateViewHeader = ({
                                   resource: resourceFromProps,
                                   title: titleFromProps,
                                   wrapperClassName,
                                   headerClassName,
                                 }: CreateHeaderProps) => {
  const { t, i18n } = useTranslation();
  const back = useBack();
  const getUserFriendlyName = useUserFriendlyName();
  const { dir } = useLanguage();

  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });

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
                "flex w-full items-center gap-2",
                headerClassName,
            )}
        >
          <Button variant="ghost" size="icon" onClick={back}>
            <ArrowLeftIcon className={cn("h-4 w-4", dir === "rtl" ? "rotate-180" : "")} />
          </Button>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      </div>
  );
};

CreateView.displayName = "CreateView";
