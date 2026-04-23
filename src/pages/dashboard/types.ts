import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/rbac";



export type DashboardIdentity = {
    id: string;
    name: string;
    email?: string;
    role: Role;
};

export type HeroMetric = {
    label: string;
    value: string | number;
    icon: LucideIcon;
};

export type JourneyStep = {
    title: string;
    status: "done" | "current" | "next" | "locked";
};

export type BadgeItem = {
    title: string;
    icon: LucideIcon;
    hint: string;
};

export type AchievementItem = {
    id: string;
    category: "profile" | "tasks" | "consultations" | "review" | "consistency";
    progress: number;
    target: number;
    achieved: boolean;
};

export type PlannerEventTag = "urgent" | "updated" | "momentum" | "event";
export type PlannerEventKind = "task" | "todo" | "consultation" | "review" | "event" | "reminder";

export type PlannerEvent = {
    id: string;
    title: string;
    date: string;
    description: string;
    tag: PlannerEventTag;
    kind: PlannerEventKind;
};

export type DashboardPresentationData = {
    heroLabel: string;
    heroDescription: string;
    progressLabel: string;
    progressValue: number;
    streakDays: number;
    metrics: HeroMetric[];
    journeyTitle: string;
    journeySteps: JourneyStep[];
    badges: BadgeItem[];
    plannerEvents: PlannerEvent[];
    reportTitle: string;
    reportDescription: string;
};
