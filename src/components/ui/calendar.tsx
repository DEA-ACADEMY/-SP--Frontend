"use client";

import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { arSA, enUS } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "./button";

function Calendar({
                      className,
                      classNames,
                      showOutsideDays = true,
                      ...props
                  }: React.ComponentProps<typeof DayPicker>) {
    const { dir, language } = useLanguage();

    return (
        <DayPicker
            dir={dir}
            locale={language === "ar" ? arSA : enUS}
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex w-full flex-col gap-2",
                month: "flex w-full flex-col gap-4",
                caption: "relative flex w-full items-center justify-center pt-1",
                caption_label: "text-sm font-medium",
                nav: "flex items-center gap-1",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "size-8 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: dir === "rtl" ? "absolute right-0" : "absolute left-0",
                nav_button_next: dir === "rtl" ? "absolute left-0" : "absolute right-0",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell:
                    "flex-1 text-center text-muted-foreground font-normal text-[0.8rem]",
                row: "mt-2 flex w-full",
                cell: cn(
                    "relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-11 w-full p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_start:
                    "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
                day_range_end:
                    "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground aria-selected:text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ className, ...props }) =>
                    dir === "rtl" ? (
                        <ChevronRight className={cn("size-4", className)} {...props} />
                    ) : (
                        <ChevronLeft className={cn("size-4", className)} {...props} />
                    ),
                IconRight: ({ className, ...props }) =>
                    dir === "rtl" ? (
                        <ChevronLeft className={cn("size-4", className)} {...props} />
                    ) : (
                        <ChevronRight className={cn("size-4", className)} {...props} />
                    ),
            }}
            {...props}
        />
    );
}

export { Calendar };