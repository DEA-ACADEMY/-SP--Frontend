import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { LanguageToggle } from "@/components/refine-ui/language/language-toggle";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
    useActiveAuthProvider,
    useGetIdentity,
    useLogout,
} from "@refinedev/core";
import { LogOutIcon, Settings, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/refine-ui/language/language-provider";

export const Header = () => {
    const { isMobile } = useSidebar();

    return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
    const { dir } = useLanguage();

    return (
        <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-border bg-sidebar">
            <div className="relative h-full w-full px-4 lg:px-6">
                <div
                    className={cn(
                        "absolute inset-y-0 flex items-center",
                        dir === "rtl" ? "right-4 lg:right-6" : "left-4 lg:left-6",
                    )}
                >
                    <SidebarTrigger className="text-muted-foreground" />
                </div>

                <div
                    className={cn(
                        "absolute inset-y-0 flex items-center gap-3",
                        dir === "rtl" ? "left-4 lg:left-6" : "right-4 lg:right-6",
                        dir === "rtl" && "flex-row-reverse",
                    )}
                >
                    <LanguageToggle />
                    <ThemeToggle />
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
}

function MobileHeader() {
    const { open, isMobile } = useSidebar();
    const { dir } = useLanguage();

    return (
        <header className="sticky top-0 z-40 h-12 shrink-0 border-b border-border bg-sidebar">
            <div className="relative h-full w-full px-3">
                <SidebarTrigger
                    className={cn("absolute inset-y-0 my-auto text-muted-foreground", dir === "rtl" ? "right-3" : "left-3", {
                        "opacity-0": open,
                        "opacity-100": !open || isMobile,
                        "pointer-events-auto": !open || isMobile,
                        "pointer-events-none": open && !isMobile,
                    })}
                />

                <div
                    className={cn(
                        "absolute inset-y-0 flex items-center gap-2",
                        dir === "rtl" ? "left-3" : "right-3",
                        dir === "rtl" && "flex-row-reverse",
                    )}
                >
                    <LanguageToggle className="h-8 w-8" />
                    <ThemeToggle className="h-8 w-8" />
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
}

type Identity = {
    fullName?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    avatar?: string;
};

const UserDropdown = () => {
    const { t } = useTranslation();
    const { dir } = useLanguage();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();
    const authProvider = useActiveAuthProvider();
    const { data: user } = useGetIdentity<Identity>();

    if (!authProvider?.getIdentity) {
        return null;
    }

    const displayName =
        user?.fullName?.trim() || user?.name?.trim() || t("common.myAccount");
    const email = user?.email?.trim() || "";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <UserAvatar />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={dir === "rtl" ? "start" : "end"}
                className="w-56"
            >
                <DropdownMenuLabel className={dir === "rtl" ? "text-right" : "text-left"}>
                    <div className="space-y-1">
                        <div className="text-sm font-semibold">{displayName}</div>
                        {email ? (
                            <div className="text-xs text-muted-foreground">{email}</div>
                        ) : null}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link
                        to="/profile"
                        className={cn("flex cursor-pointer items-center gap-2", dir === "rtl" && "flex-row-reverse")}
                    >
                        <UserCircle2 className="h-4 w-4" />
                        <span>{t("common.profile")}</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        to="/settings"
                        className={cn("flex cursor-pointer items-center gap-2", dir === "rtl" && "flex-row-reverse")}
                    >
                        <Settings className="h-4 w-4" />
                        <span>{t("common.settings")}</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => logout()}
                    className={cn(dir === "rtl" && "flex-row-reverse")}
                >
                    <LogOutIcon className="text-destructive" />
                    <span className="text-destructive">
                        {isLoggingOut ? t("common.loggingOut") : t("common.logout")}
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

Header.displayName = "Header";
