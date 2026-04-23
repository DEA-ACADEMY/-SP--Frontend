import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import type { JourneyStep } from "./types.ts";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { useTranslation } from "react-i18next";

export function IdpJourneyCard({
    title,
    steps,
}: {
    title: string;
    steps: JourneyStep[];
}) {
    const { dir } = useLanguage();
    const { t } = useTranslation();

    const statusStyles = {
        done: {
            dot: "bg-primary text-primary-foreground border-primary",
            pill: "bg-primary text-primary-foreground",
            label: t("dashboard.journey.status.done"),
            icon: Check,
            card: "bg-card",
        },
        current: {
            dot: "bg-primary text-primary-foreground border-primary",
            pill: "bg-accent text-accent-foreground",
            label: t("dashboard.journey.status.current"),
            icon: ArrowRight,
            card: "bg-accent/45 border-primary/20",
        },
        next: {
            dot: "bg-card text-primary border-primary/40",
            pill: "bg-primary text-primary-foreground",
            label: t("dashboard.journey.status.next"),
            icon: Sparkles,
            card: "bg-card",
        },
        locked: {
            dot: "bg-muted text-muted-foreground border-border",
            pill: "bg-muted text-muted-foreground",
            label: t("dashboard.journey.status.locked"),
            icon: Lock,
            card: "bg-card",
        },
    } as const;

    return (
        <Card className="h-full min-w-0 overflow-hidden shadow-lg">
            <CardHeader className={dir === "rtl" ? "text-right" : "text-left"}>
                <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("dashboard.journey.subtitle")}</p>
            </CardHeader>

            <CardContent className="min-w-0 overflow-hidden">
                <div className="space-y-5">
                    {steps.map((step, index) => {
                        const config = statusStyles[step.status];
                        const Icon = config.icon;
                        const isLast = index === steps.length - 1;

                        return (
                            <div
                                key={`${step.title}-${index}`}
                                className={cn(
                                    "grid gap-4",
                                    dir === "rtl"
                                        ? "grid-cols-[minmax(0,1fr)_48px]"
                                        : "grid-cols-[48px_minmax(0,1fr)]"
                                )}
                            >
                                {dir === "rtl" ? (
                                    <>
                                        <div
                                            className={cn(
                                                "flex min-h-[82px] items-center justify-between gap-3 rounded-3xl border px-5 py-4 shadow-sm flex-row-reverse",
                                                config.card
                                            )}
                                        >
                                            <div className="min-w-0 text-lg font-semibold text-right md:text-2xl">{step.title}</div>

                                            <div className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-bold", config.pill)}>
                                                {config.label}
                                            </div>
                                        </div>

                                        <div className="relative flex items-center justify-center">
                                            {!isLast ? (
                                                <div className="absolute left-1/2 top-12 h-[calc(100%+1.25rem)] w-[3px] -translate-x-1/2 rounded-full bg-primary/20" />
                                            ) : null}

                                            <div className={cn("relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 shadow-sm", config.dot)}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative flex items-center justify-center">
                                            {!isLast ? (
                                                <div className="absolute left-1/2 top-12 h-[calc(100%+1.25rem)] w-[3px] -translate-x-1/2 rounded-full bg-primary/20" />
                                            ) : null}

                                            <div className={cn("relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 shadow-sm", config.dot)}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className={cn("flex min-h-[82px] items-center justify-between gap-3 rounded-3xl border px-5 py-4 shadow-sm", config.card)}>
                                            <div className="min-w-0 text-lg font-semibold md:text-2xl">{step.title}</div>

                                            <div className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-bold", config.pill)}>
                                                {config.label}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
