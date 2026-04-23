import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Navigate } from "react-router-dom";
import { authProvider } from "./providers/auth";

import routerProvider, {
    DocumentTitleHandler,
    UnsavedChangesNotifier,
} from "@refinedev/react-router";

import {
    BrowserRouter,
    Outlet,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { Layout } from "@/components/refine-ui/layout/layout";

import LoginPage from "@/pages/login/login.tsx";
import Dashboard from "@/pages/dashboard/dashboard.tsx";
import Notifications from "@/pages/notification/notification.tsx";
import Profile from "@/pages/profile/profile.tsx";
import Settings from "@/pages/settings/settings.tsx";

import Students from "@/pages/students/list.tsx";
import StudentStaffProfilePage from "@/pages/students/profile";
import StudentCreatePage from "@/pages/students/create";

import Supervisors from "@/pages/supervisors/list";
import SupervisorCreatePage from "@/pages/supervisors/create";
import SupervisorProfilePage from "@/pages/supervisors/profile";

import Tasks from "@/pages/tasks/list.tsx";
import TaskShow from "@/pages/tasks/show";
import TaskCreate from "@/pages/tasks/create.tsx";
import TaskEdit from "@/pages/tasks/edit";

import Branches from "@/pages/branches/list";
import BranchCreate from "@/pages/branches/create";
import BranchEdit from "@/pages/branches/edit";
import BranchShow from "@/pages/branches/show";
import Enrollments from "@/pages/enrollments/list";
import Cohorts from "@/pages/cohorts/list";
import Programs from "@/pages/program/list";
import ProgramCreate from "@/pages/program/create";
import ProgramEdit from "@/pages/program/edit";
import ProgramShow from "@/pages/program/show";


import { appI18nProvider } from "@/providers/i18n";

import Consultations from "@/pages/consultations/list";
import ConsultationCreate from "@/pages/consultations/create";
import ConsultationShow from "@/pages/consultations/show";

import MiniGamesPage from "@/pages/games/list.tsx";

import { canAccessPath, getResourcesForRole, roleHome, type Role } from "@/lib/rbac";

import Logo from "../public/logo.png"
import {LanguageProvider} from "@/components/refine-ui/language/language-provider.tsx";
import { useLanguage } from "@/components/refine-ui/language/language-provider";
import { useTranslation } from "react-i18next";

function RoleGuard({
                       role,
                       children,
                   }: {
    role: Role | null | undefined;
    children: ReactNode;
}) {
    const location = useLocation();

    if (role === undefined) return null;

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (!canAccessPath(role, location.pathname)) {
        return <Navigate to={roleHome(role)} replace />;
    }

    return <>{children}</>;
}

function RefineApp() {
    return (
        <RefineKbarProvider>
            <ThemeProvider>
                <LanguageProvider>
                    <RefineShell />
                </LanguageProvider>
            </ThemeProvider>
        </RefineKbarProvider>
    );
}

function RefineShell() {
    const location = useLocation();
    const { t } = useTranslation();
    const { dir } = useLanguage();
    const [role, setRole] = useState<Role | null | undefined>(undefined);

    useEffect(() => {
        let active = true;

        const loadRole = async () => {
            try {
                const nextRole = (await authProvider.getPermissions?.()) as Role | null;
                if (active) setRole(nextRole ?? null);
            } catch {
                if (active) setRole(null);
            }
        };

        loadRole();

        return () => {
            active = false;
        };
    }, [location.pathname]);

    const resources = useMemo(() => {
        return getResourcesForRole(role ?? null);
    }, [role]);

    return (
        <div dir={dir} className="min-h-screen bg-background text-foreground">
                <DevtoolsProvider>
                    <Refine
                        dataProvider={dataProvider}
                        authProvider={authProvider}
                        i18nProvider={appI18nProvider}
                        notificationProvider={useNotificationProvider()}
                        routerProvider={routerProvider}
                        resources={resources}
                        options={{
                            syncWithLocation: true,
                            warnWhenUnsavedChanges: true,
                            projectId: "aubI2W-xpbW3Y-mfatj5",
                            title: {
                                text: t("brand.fullName"),
                                icon: (
                                    <img
                                        src={Logo}
                                        alt="Logo"
                                        style={{ width: 24, height: 24, objectFit: "contain" }}
                                    />
                                ),
                            },
                        }}
                    >
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />

                            <Route
                                element={
                                    <Authenticated
                                        key="protected-routes"
                                        fallback={<Navigate to="/login" replace />}
                                    >
                                        <RoleGuard role={role}>
                                            <Layout>
                                                <Outlet />
                                            </Layout>
                                        </RoleGuard>
                                    </Authenticated>
                                }
                            >
                                {/* role homes */}
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/student" element={<Dashboard />} />
                                <Route path="/supervisor" element={<Dashboard />} />
                                <Route path="/donor" element={<Dashboard />} />
                                <Route path="/expert" element={<Dashboard />} />

                                {/* common */}
                                <Route path="/notifications" element={<Notifications />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />

                                {/* Supervisors */}
                                <Route path="/supervisors" element={<Supervisors />} />
                                <Route path="/supervisors/create" element={<SupervisorCreatePage />} />
                                <Route path="/supervisors/:id/profile" element={<SupervisorProfilePage />} />


                                {/* students */}
                                <Route path="/students" element={<Students />} />
                                <Route path="/students/:id/profile" element={<StudentStaffProfilePage />} />
                                <Route path="/students/create" element={<StudentCreatePage />} />


                                {/* tasks */}
                                <Route path="/tasks" element={<Tasks />} />
                                <Route path="/tasks/create" element={<TaskCreate />} />
                                <Route path="/tasks/show/:id" element={<TaskShow />} />
                                <Route path="/tasks/edit/:id" element={<TaskEdit />} />

                                {/* branches */}
                                <Route path="/branches" element={<Branches />} />
                                <Route path="/branches/create" element={<BranchCreate />} />
                                <Route path="/branches/edit/:id" element={<BranchEdit />} />
                                <Route path="/branches/show/:id" element={<BranchShow />} />

                                {/* programs */}
                                <Route path="/programs" element={<Programs />} />
                                <Route path="/programs/create" element={<ProgramCreate />} />
                                <Route path="/programs/edit/:id" element={<ProgramEdit />} />
                                <Route path="/programs/show/:id" element={<ProgramShow />} />

                                {/* cohorts */}
                                <Route path="/cohorts" element={<Cohorts />} />

                                {/* enrollments */}
                                <Route path="/enrollments" element={<Enrollments />} />


                                {/* consultations */}

                                <Route path="/consultations" element={<Consultations />} />
                                <Route path="/consultations/create" element={<ConsultationCreate />} />
                                <Route path="/consultations/show/:id" element={<ConsultationShow />} />

                                <Route path="/mini-games" element={<MiniGamesPage />} />

                            </Route>

                            <Route
                                path="*"
                                element={
                                    <Navigate
                                        to={role ? roleHome(role) : "/login"}
                                        replace
                                    />
                                }
                            />
                        </Routes>

                        <Toaster />
                        <RefineKbar />
                        <UnsavedChangesNotifier />
                        <DocumentTitleHandler />
                    </Refine>

                    <DevtoolsPanel />
                </DevtoolsProvider>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <RefineApp />
        </BrowserRouter>
    );
}

export default App;
