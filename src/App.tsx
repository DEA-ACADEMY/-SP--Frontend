import { Refine, Authenticated } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Navigate } from "react-router-dom";
import { authProvider } from "./providers/auth";
import { fetchWithAuth } from "./providers/fetcher";


import routerProvider, {
    DocumentTitleHandler,
    UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Home, Bell, User,CalendarIcon, Settings as SettingsIcon } from "lucide-react";

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

import Tasks from "@/pages/tasks/list.tsx"
import TaskShow from "@/pages/tasks/show";
import TaskCreate from "@/pages/tasks/create.tsx";


function App() {
    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <ThemeProvider>
                    <DevtoolsProvider>
                        <Refine
                            dataProvider={dataProvider}
                            authProvider={authProvider}
                            notificationProvider={useNotificationProvider()}
                            routerProvider={routerProvider}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                                projectId: "aubI2W-xpbW3Y-mfatj5",
                            }}
                            resources={[
                                {
                                    name: "dashboard",
                                    list: "/",
                                    meta: { label: "Dashboard", icon: <Home size={18} /> },
                                },
                                {
                                    name: "notifications",
                                    list: "/notifications",
                                    meta: { label: "Notifications", icon: <Bell size={18} /> },
                                },
                                {
                                    name: "tasks",
                                    list: "/tasks",
                                    create: "/tasks/create",
                                    edit: "/tasks/edit/:id",
                                    show: "/tasks/show/:id",
                                    meta: { label: "tasks", icon: <CalendarIcon size={18} /> },
                                },
                                {
                                    name: "profile",
                                    list: "/profile",
                                    meta: { label: "Profile", icon: <User size={18} /> },
                                },
                                {
                                    name: "settings",
                                    list: "/settings",
                                    meta: { label: "Settings", icon: <SettingsIcon size={18} /> },
                                },
                            ]}
                        >
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    element={
                                        <Authenticated fallback={<Navigate to="/login" replace/>} key={""}>
                                            <Layout>
                                                <Outlet />
                                            </Layout>
                                        </Authenticated>
                                    }
                                >
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/settings" element={<Settings />} />

                                    <Route path="/tasks" element={<Tasks />} />
                                    <Route path="/tasks/create" element={<TaskCreate />} />
                                    <Route path="/tasks/show/:id" element={<TaskShow />} />

                                </Route>
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
        </BrowserRouter>
    );
}

export default App;
