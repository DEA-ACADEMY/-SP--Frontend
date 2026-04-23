import {
    Bell,
    BookCheck,
    CalendarClock,
    Flame,
    FolderKanban,
    Goal,
    MessageCircleMore,
    Rocket,
    ScrollText,
    Sparkles,
    Users,
} from "lucide-react";
import type { Role } from "@/lib/rbac";
import type { DashboardPresentationData } from "./types";

type Translate = (key: string) => string;

export function getPresentationData(role: Role, t: Translate): DashboardPresentationData {
    const sharedBadges = [
        { title: t("dashboard.badges.streak.title"), icon: Flame, hint: t("dashboard.badges.streak.hint") },
        { title: t("dashboard.badges.fastStarter.title"), icon: Rocket, hint: t("dashboard.badges.fastStarter.hint") },
        { title: t("dashboard.badges.focusPeak.title"), icon: Goal, hint: t("dashboard.badges.focusPeak.hint") },
        {
            title: t("dashboard.badges.consultationStar.title"),
            icon: MessageCircleMore,
            hint: t("dashboard.badges.consultationStar.hint"),
        },
    ];

    if (role === "management") {
        return {
            heroLabel: t("dashboard.presentation.management.heroLabel"),
            heroDescription: t("dashboard.presentation.management.heroDescription"),
            progressLabel: t("dashboard.presentation.management.progressLabel"),
            progressValue: 64,
            streakDays: 12,
            metrics: [
                { label: t("dashboard.presentation.management.metrics.studentsFollowUp"), value: 14, icon: Users },
                { label: t("dashboard.presentation.management.metrics.reportsWaiting"), value: 3, icon: ScrollText },
                { label: t("dashboard.presentation.management.metrics.unreadNotifications"), value: 8, icon: Bell },
            ],
            journeyTitle: t("dashboard.journey.title"),
            journeySteps: [
                { title: t("dashboard.presentation.management.steps.permissionsConfigured"), status: "done" },
                { title: t("dashboard.presentation.management.steps.flowReviewed"), status: "done" },
                { title: t("dashboard.presentation.management.steps.quarterlyReview"), status: "current" },
                { title: t("dashboard.presentation.management.steps.nextPriorities"), status: "next" },
                { title: t("dashboard.presentation.management.steps.advancedAnalytics"), status: "locked" },
            ],
            badges: sharedBadges,
            plannerEvents: [
                {
                    id: "m1",
                    title: t("dashboard.presentation.management.events.reviewMeeting.title"),
                    date: "2026-04-09",
                    description: t("dashboard.presentation.management.events.reviewMeeting.description"),
                    tag: "urgent",
                    kind: "event"
                },
                {
                    id: "m2",
                    title: t("dashboard.presentation.management.events.priorityUpdate.title"),
                    date: "2026-04-12",
                    description: t("dashboard.presentation.management.events.priorityUpdate.description"),
                    tag: "updated",
                    kind: "event"
                },
                {
                    id: "m3",
                    title: t("dashboard.presentation.management.events.pdfExport.title"),
                    date: "2026-04-14",
                    description: t("dashboard.presentation.management.events.pdfExport.description"),
                    tag: "momentum",
                    kind: "event"
                },
            ],
            reportTitle: t("dashboard.presentation.management.reportTitle"),
            reportDescription: t("dashboard.presentation.management.reportDescription"),
        };
    }

    if (role === "supervisor") {
        return {
            heroLabel: t("dashboard.presentation.supervisor.heroLabel"),
            heroDescription: t("dashboard.presentation.supervisor.heroDescription"),
            progressLabel: t("dashboard.presentation.supervisor.progressLabel"),
            progressValue: 71,
            streakDays: 9,
            metrics: [
                { label: t("dashboard.presentation.supervisor.metrics.tasksPending"), value: 6, icon: BookCheck },
                { label: t("dashboard.presentation.supervisor.metrics.newConsultations"), value: 2, icon: MessageCircleMore },
                { label: t("dashboard.presentation.supervisor.metrics.followUps"), value: 11, icon: CalendarClock },
            ],
            journeyTitle: t("dashboard.journey.title"),
            journeySteps: [
                { title: t("dashboard.presentation.supervisor.steps.studentProfiles"), status: "done" },
                { title: t("dashboard.presentation.supervisor.steps.firstAssessment"), status: "done" },
                { title: t("dashboard.presentation.supervisor.steps.replyConsultation"), status: "current" },
                { title: t("dashboard.presentation.supervisor.steps.approveWork"), status: "next" },
                { title: t("dashboard.presentation.supervisor.steps.performanceBoard"), status: "locked" },
            ],
            badges: sharedBadges,
            plannerEvents: [
                {
                    id: "s1",
                    title: t("dashboard.presentation.supervisor.events.weeklyFollowUp.title"),
                    date: "2026-04-08",
                    description: t("dashboard.presentation.supervisor.events.weeklyFollowUp.description"),
                    tag: "event",
                    kind: "event"
                },
                {
                    id: "s2",
                    title: t("dashboard.presentation.supervisor.events.reviewWindow.title"),
                    date: "2026-04-09",
                    description: t("dashboard.presentation.supervisor.events.reviewWindow.description"),
                    tag: "urgent",
                    kind: "event"
                },
                {
                    id: "s3",
                    title: t("dashboard.presentation.supervisor.events.consultationNotice.title"),
                    date: "2026-04-10",
                    description: t("dashboard.presentation.supervisor.events.consultationNotice.description"),
                    tag: "updated",
                    kind: "event"
                },
            ],
            reportTitle: t("dashboard.presentation.supervisor.reportTitle"),
            reportDescription: t("dashboard.presentation.supervisor.reportDescription"),
        };
    }

    if (role === "student") {
        return {
            heroLabel: t("dashboard.presentation.student.heroLabel"),
            heroDescription: t("dashboard.presentation.student.heroDescription"),
            progressLabel: t("dashboard.presentation.student.progressLabel"),
            progressValue: 38,
            streakDays: 7,
            metrics: [
                { label: t("dashboard.presentation.student.metrics.unreadNotifications"), value: 3, icon: Bell },
                { label: t("dashboard.presentation.student.metrics.openTasks"), value: 5, icon: FolderKanban },
                { label: t("dashboard.presentation.student.metrics.newReply"), value: 1, icon: MessageCircleMore },
            ],
            journeyTitle: t("dashboard.journey.title"),
            journeySteps: [
                { title: t("dashboard.presentation.student.steps.profileSetup"), status: "done" },
                { title: t("dashboard.presentation.student.steps.firstTask"), status: "done" },
                { title: t("dashboard.presentation.student.steps.firstConsultation"), status: "current" },
                { title: t("dashboard.presentation.student.steps.submitWork"), status: "next" },
                { title: t("dashboard.presentation.student.steps.consistencyMilestone"), status: "locked" },
            ],
            badges: sharedBadges,
            plannerEvents: [
                {
                    id: "st1",
                    title: t("dashboard.presentation.student.events.proposalDeadline.title"),
                    date: "2026-04-09",
                    description: t("dashboard.presentation.student.events.proposalDeadline.description"),
                    tag: "event",
                    kind: "event"
                },
                {
                    id: "st2",
                    title: t("dashboard.presentation.student.events.urgentTask.title"),
                    date: "2026-04-11",
                    description: t("dashboard.presentation.student.events.urgentTask.description"),
                    tag: "urgent",
                    kind: "event"
                },
                {
                    id: "st3",
                    title: t("dashboard.presentation.student.events.supervisorUpdates.title"),
                    date: "2026-04-12",
                    description: t("dashboard.presentation.student.events.supervisorUpdates.description"),
                    tag: "updated",
                    kind: "event"
                },
            ],
            reportTitle: t("dashboard.presentation.student.reportTitle"),
            reportDescription: t("dashboard.presentation.student.reportDescription"),
        };
    }

    if (role === "expert") {
        return {
            heroLabel: t("dashboard.presentation.expert.heroLabel"),
            heroDescription: t("dashboard.presentation.expert.heroDescription"),
            progressLabel: t("dashboard.presentation.expert.progressLabel"),
            progressValue: 58,
            streakDays: 6,
            metrics: [
                { label: t("dashboard.presentation.expert.metrics.reviewsAssigned"), value: 4, icon: BookCheck },
                { label: t("dashboard.presentation.expert.metrics.consultationsQueue"), value: 3, icon: MessageCircleMore },
                { label: t("dashboard.presentation.expert.metrics.unreadNotices"), value: 2, icon: Bell },
            ],
            journeyTitle: t("dashboard.journey.title"),
            journeySteps: [
                { title: t("dashboard.presentation.expert.steps.reviewAccess"), status: "done" },
                { title: t("dashboard.presentation.expert.steps.firstConsultation"), status: "done" },
                { title: t("dashboard.presentation.expert.steps.detailedFeedback"), status: "current" },
                { title: t("dashboard.presentation.expert.steps.supportPlanning"), status: "next" },
                { title: t("dashboard.presentation.expert.steps.expandedWorkspace"), status: "locked" },
            ],
            badges: sharedBadges,
            plannerEvents: [
                {
                    id: "e1",
                    title: t("dashboard.presentation.expert.events.feedbackSession.title"),
                    date: "2026-04-09",
                    description: t("dashboard.presentation.expert.events.feedbackSession.description"),
                    tag: "event",
                    kind: "event",
                },
            ],
            reportTitle: t("dashboard.presentation.expert.reportTitle"),
            reportDescription: t("dashboard.presentation.expert.reportDescription"),
        };
    }

    return {
        heroLabel: t("dashboard.presentation.donor.heroLabel"),
        heroDescription: t("dashboard.presentation.donor.heroDescription"),
        progressLabel: t("dashboard.presentation.donor.progressLabel"),
        progressValue: 52,
        streakDays: 5,
        metrics: [
            { label: t("dashboard.presentation.donor.metrics.highlights"), value: 2, icon: Sparkles },
            { label: t("dashboard.presentation.donor.metrics.unreadUpdates"), value: 4, icon: Bell },
            { label: t("dashboard.presentation.donor.metrics.upcomingEvents"), value: 3, icon: CalendarClock },
        ],
        journeyTitle: t("dashboard.journey.title"),
        journeySteps: [
            { title: t("dashboard.presentation.donor.steps.overviewOpened"), status: "done" },
            { title: t("dashboard.presentation.donor.steps.impactSnapshot"), status: "current" },
            { title: t("dashboard.presentation.donor.steps.milestoneFollowUp"), status: "next" },
            { title: t("dashboard.presentation.donor.steps.reportAccess"), status: "locked" },
            { title: t("dashboard.presentation.donor.steps.deeperInsights"), status: "locked" },
        ],
        badges: sharedBadges,
        plannerEvents: [
            {
                id: "d1",
                title: t("dashboard.presentation.donor.events.programUpdate.title"),
                date: "2026-04-10",
                description: t("dashboard.presentation.donor.events.programUpdate.description"),
                tag: "event",
                kind: "event",
            },
        ],
        reportTitle: t("dashboard.presentation.donor.reportTitle"),
        reportDescription: t("dashboard.presentation.donor.reportDescription"),
    };
}
