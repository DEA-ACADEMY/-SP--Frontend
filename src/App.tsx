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

import Tasks from "@/pages/tasks/list.tsx";
import TaskShow from "@/pages/tasks/show";
import TaskCreate from "@/pages/tasks/create.tsx";
import TaskEdit from "@/pages/tasks/edit";

import Programs from "@/pages/program/list.tsx";
import ProgramShow from "@/pages/program/show.tsx";
import ProgramCreate from "@/pages/program/create.tsx";
import ProgramEdit from "@/pages/program/edit.tsx";

import { canAccessPath, getResourcesForRole, roleHome, type Role } from "@/lib/rbac";

import Logo from "../public/logo.png"

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
    const location = useLocation();
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
        <RefineKbarProvider>
            <ThemeProvider>
                <DevtoolsProvider>
                    <Refine
                        dataProvider={dataProvider}
                        authProvider={authProvider}
                        notificationProvider={useNotificationProvider()}
                        routerProvider={routerProvider}
                        resources={resources}
                        options={{
                            syncWithLocation: true,
                            warnWhenUnsavedChanges: true,
                            projectId: "aubI2W-xpbW3Y-mfatj5",
                            title: {
                                text: "SNOWBALL",
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

                                {/* students */}
                                <Route path="/students" element={<Students />} />

                                {/* tasks */}
                                <Route path="/tasks" element={<Tasks />} />
                                <Route path="/tasks/create" element={<TaskCreate />} />
                                <Route path="/tasks/show/:id" element={<TaskShow />} />
                                <Route path="/tasks/edit/:id" element={<TaskEdit />} />

                                {/* programs */}
                                <Route path="/programs" element={<Programs />} />
                                <Route path="/programs/create" element={<ProgramCreate />} />
                                <Route path="/programs/show/:id" element={<ProgramShow />} />
                                <Route path="/programs/edit/:id" element={<ProgramEdit />} />
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
            </ThemeProvider>
        </RefineKbarProvider>
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