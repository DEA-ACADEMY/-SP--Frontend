import type { ReactNode } from "react";
import {
    Home,
    Bell,
    User,
    CalendarIcon,
    Settings as SettingsIcon,
    GraduationCap as StudentsIcon,
    BookOpen as ProgramIcon,
    Building2 as BranchIcon,
    Layers3 as CohortIcon,
    ClipboardList as EnrollmentIcon,
} from "lucide-react";

export type Role = "student" | "supervisor" | "management" | "donor" | "expert";

export type AppResource = {
    name: string;
    list: string;
    create?: string;
    edit?: string;
    show?: string;
    meta?: {
        label: string;
        icon?: ReactNode;
    };
};

export function roleHome(role?: Role | null): string {
    switch (role) {
        case "management":
            return "/";
        case "supervisor":
            return "/supervisor";
        case "student":
            return "/student";
        case "donor":
            return "/donor";
        case "expert":
            return "/expert";
        default:
            return "/login";
    }
}

export function getResourcesForRole(role?: Role | null): AppResource[] {
    if (!role) return [];

    const dashboardResource: AppResource = {
        name: "dashboard",
        list: roleHome(role),
        meta: {
            label: "Dashboard",
            icon: <Home size={18} />,
        },
    };

    const common: AppResource[] = [
        dashboardResource,
        {
            name: "notifications",
            list: "/notifications",
            meta: {
                label: "Notifications",
                icon: <Bell size={18} />,
            },
        },
        {
            name: "profile",
            list: "/profile",
            meta: {
                label: "Profile",
                icon: <User size={18} />,
            },
        },
        {
            name: "settings",
            list: "/settings",
            meta: {
                label: "Settings",
                icon: <SettingsIcon size={18} />,
            },
        },
    ];

    const studentsResource: AppResource = {
        name: "students",
        list: "/students",
        meta: {
            label: "Students",
            icon: <StudentsIcon size={18} />,
        },
    };

    const tasksResource: AppResource = {
        name: "tasks",
        list: "/tasks",
        create: "/tasks/create",
        edit: "/tasks/edit/:id",
        show: "/tasks/show/:id",
        meta: {
            label: "Tasks",
            icon: <CalendarIcon size={18} />,
        },
    };

    const branchesResource: AppResource = {
        name: "branches",
        list: "/branches",
        create: "/branches/create",
        edit: "/branches/edit/:id",
        show: "/branches/show/:id",
        meta: {
            label: "Branches",
            icon: <BranchIcon size={18} />,
        },
    };

    const programsResource: AppResource = {
        name: "programs",
        list: "/programs",
        create: "/programs/create",
        edit: "/programs/edit/:id",
        show: "/programs/show/:id",
        meta: {
            label: "Programs",
            icon: <ProgramIcon size={18} />,
        },
    };

    const cohortsResource: AppResource = {
        name: "cohorts",
        list: "/cohorts",
        create: "/cohorts/create",
        edit: "/cohorts/edit/:id",
        show: "/cohorts/show/:id",
        meta: {
            label: "Cohorts",
            icon: <CohortIcon size={18} />,
        },
    };

    const enrollmentsResource: AppResource = {
        name: "enrollments",
        list: "/enrollments",
        create: "/enrollments/create",
        meta: {
            label: "Enrollments",
            icon: <EnrollmentIcon size={18} />,
        },
    };

    switch (role) {
        case "management":
            return [
                ...common,
                studentsResource,
                tasksResource,
                branchesResource,
                programsResource,
                cohortsResource,
                enrollmentsResource,
            ];

        case "supervisor":
            return [
                ...common,
                studentsResource,
                tasksResource,
                {
                    name: "branches",
                    list: "/branches",
                    show: "/branches/show/:id",
                    meta: {
                        label: "Branches",
                        icon: <BranchIcon size={18} />,
                    },
                },
                {
                    name: "programs",
                    list: "/programs",
                    show: "/programs/show/:id",
                    meta: {
                        label: "Programs",
                        icon: <ProgramIcon size={18} />,
                    },
                },
                {
                    name: "cohorts",
                    list: "/cohorts",
                    show: "/cohorts/show/:id",
                    meta: {
                        label: "Cohorts",
                        icon: <CohortIcon size={18} />,
                    },
                },
            ];

        case "student":
            return [
                ...common,
                {
                    name: "tasks",
                    list: "/tasks",
                    show: "/tasks/show/:id",
                    meta: {
                        label: "Tasks",
                        icon: <CalendarIcon size={18} />,
                    },
                },
            ];

        case "donor":
            return common;

        case "expert":
            return common;

        default:
            return [];
    }
}

export function canAccessPath(role: Role, pathname: string): boolean {
    const path = pathname.replace(/\/+$/, "") || "/";

    const exact = (value: string) => path === value;
    const starts = (value: string) => path === value || path.startsWith(`${value}/`);

    if (exact("/notifications") || exact("/profile") || exact("/settings")) {
        return true;
    }

    if (role === "management" && exact("/")) return true;
    if (role === "supervisor" && exact("/supervisor")) return true;
    if (role === "student" && exact("/student")) return true;
    if (role === "donor" && exact("/donor")) return true;
    if (role === "expert" && exact("/expert")) return true;

    if (starts("/students")) {
        return role === "management" || role === "supervisor";
    }

    if (exact("/tasks") || starts("/tasks/show")) {
        return role === "management" || role === "supervisor" || role === "student";
    }

    if (starts("/tasks/create") || starts("/tasks/edit")) {
        return role === "management" || role === "supervisor";
    }

    if (exact("/branches") || starts("/branches/show")) {
        return role === "management" || role === "supervisor";
    }

    if (starts("/branches/create") || starts("/branches/edit")) {
        return role === "management";
    }

    if (exact("/programs") || starts("/programs/show")) {
        return role === "management" || role === "supervisor";
    }

    if (starts("/programs/create") || starts("/programs/edit")) {
        return role === "management";
    }

    if (exact("/cohorts") || starts("/cohorts/show")) {
        return role === "management" || role === "supervisor";
    }

    if (starts("/cohorts/create") || starts("/cohorts/edit")) {
        return role === "management";
    }

    if (exact("/enrollments") || starts("/enrollments/create")) {
        return role === "management";
    }

    return false;
}