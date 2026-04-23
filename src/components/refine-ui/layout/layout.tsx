"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { useLanguage } from "@/components/refine-ui/language/language-provider";

function LayoutContent({ children, dir }: PropsWithChildren<{ dir: "ltr" | "rtl" }>) {
    return (
        <SidebarInset>
            <Header />
            <main
                dir={dir}
                className={cn(
                    "@container/main",
                    "relative",
                    "flex",
                    "min-w-0",
                    "w-full",
                    "flex-1",
                    "flex-col",
                    "gap-4",
                    "px-4",
                    "pb-6",
                    "pt-4",
                    "md:px-6",
                    "md:pt-4",
                    "lg:px-8",
                    "lg:pt-6",
                )}
            >
                {children}
            </main>
        </SidebarInset>
    );
}

export function Layout({ children }: PropsWithChildren) {
    const { dir } = useLanguage();

    return (
        <SidebarProvider key={dir} dir={dir}>
            <Sidebar />
            <LayoutContent dir={dir}>{children}</LayoutContent>
        </SidebarProvider>
    );
}

Layout.displayName = "Layout";
