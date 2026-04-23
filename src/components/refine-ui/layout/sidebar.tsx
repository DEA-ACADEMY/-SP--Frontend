"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar as ShadcnSidebar,
    SidebarContent as ShadcnSidebarContent,
    SidebarHeader as ShadcnSidebarHeader,
    SidebarRail as ShadcnSidebarRail,
    useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
    useLink,
    useMenu,
    type TreeMenuItem,
} from "@refinedev/core";
import { ChevronRight, ListIcon } from "lucide-react";
import React from "react";
import logo from "@/assets/logo.png";
import { fetchWithAuth } from "@/providers/fetcher";
import { API_URL } from "@/providers/constants";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/components/refine-ui/language/language-provider";

import i18n from "@/language/i18n";
import { useTranslation } from "react-i18next";

type SidebarBadgeEntry = {
    count: number;
    severity: "low" | "medium" | "high";
};

type SidebarBadgesResponse = {
    tasks?: SidebarBadgeEntry;
    notifications?: SidebarBadgeEntry;
    consultations?: SidebarBadgeEntry;
};

const severityClassMap: Record<NonNullable<SidebarBadgeEntry["severity"]>, string> = {
    low: "border-primary/30 bg-primary/10 text-foreground",
    medium: "border-chart-5/40 bg-chart-5/15 text-foreground",
    high: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function Sidebar() {
    const { open } = useShadcnSidebar();
    const { menuItems, selectedKey } = useMenu();
    const location = useLocation();
    const { dir } = useLanguage();
    const [badgeMap, setBadgeMap] = useState<Record<string, SidebarBadgeEntry>>({});

    useEffect(() => {
        let active = true;

        async function loadSidebarBadges() {
            try {
                const data = await fetchWithAuth(`${API_URL}/dashboard/sidebar-badges`).then((res) => {
                    if (!res.ok) throw new Error("Failed to load sidebar badges");
                    return res.json() as Promise<SidebarBadgesResponse>;
                });

                if (!active) return;

                setBadgeMap({
                    notifications: data.notifications ?? { count: 0, severity: "low" },
                    tasks: data.tasks ?? { count: 0, severity: "low" },
                    "advice-threads": data.consultations ?? { count: 0, severity: "low" },
                });
            } catch {
                if (!active) return;
                setBadgeMap({});
            }
        }

        void loadSidebarBadges();

        return () => {
            active = false;
        };
    }, [location.pathname]);

    return (
        <ShadcnSidebar
            side={dir === "rtl" ? "right" : "left"}
            collapsible="icon"
            className={cn("border-none")}
        >
            <ShadcnSidebarRail />
            <SidebarHeader />
            <ShadcnSidebarContent
                className={cn(
                    "transition-discrete",
                    "duration-200",
                    "flex",
                    "flex-col",
                    "gap-2",
                    "pt-2",
                    "pb-2",
                    dir === "rtl" ? "border-l" : "border-r",
                    "border-border",
                    {
                        "px-3": open,
                        "px-1": !open,
                    }
                )}
            >
                {menuItems.map((item: TreeMenuItem) => (
                    <SidebarItem
                        key={item.key || item.name}
                        item={item}
                        selectedKey={selectedKey}
                        badgeMap={badgeMap}
                    />
                ))}
            </ShadcnSidebarContent>
        </ShadcnSidebar>
    );
}

type MenuItemProps = {
    item: TreeMenuItem;
    selectedKey?: string;
    badgeMap: Record<string, SidebarBadgeEntry>;
};

function SidebarItem({ item, selectedKey, badgeMap }: MenuItemProps) {
    const { open } = useShadcnSidebar();

    if (item.meta?.group) {
        return <SidebarItemGroup item={item} selectedKey={selectedKey} badgeMap={badgeMap} />;
    }

    if (item.children && item.children.length > 0) {
        if (open) {
            return <SidebarItemCollapsible item={item} selectedKey={selectedKey} badgeMap={badgeMap} />;
        }
        return <SidebarItemDropdown item={item} selectedKey={selectedKey} badgeMap={badgeMap} />;
    }

    return <SidebarItemLink item={item} selectedKey={selectedKey} badgeMap={badgeMap} />;
}

function SidebarItemGroup({ item, selectedKey, badgeMap }: MenuItemProps) {
    const { children } = item;
    const { open } = useShadcnSidebar();
    const { dir } = useLanguage();

    return (
        <div className={cn("border-t", "border-sidebar-border", "pt-4")}>
            <span
                className={cn(
                    dir === "rtl" ? "mr-3 text-right" : "ml-3 text-left",
                    "block",
                    "text-xs",
                    "font-semibold",
                    "uppercase",
                    "text-muted-foreground",
                    "transition-all",
                    "duration-200",
                    {
                        "h-8": open,
                        "h-0": !open,
                        "opacity-0": !open,
                        "opacity-100": open,
                        "pointer-events-none": !open,
                        "pointer-events-auto": open,
                    }
                )}
            >
                {getDisplayName(item)}
            </span>

            {children && children.length > 0 && (
                <div className={cn("flex", "flex-col")}>
                    {children.map((child: TreeMenuItem) => (
                        <SidebarItem
                            key={child.key || child.name}
                            item={child}
                            selectedKey={selectedKey}
                            badgeMap={badgeMap}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SidebarItemCollapsible({ item, selectedKey, badgeMap }: MenuItemProps) {
    const { name, children } = item;
    const { dir } = useLanguage();

    const chevronIcon = (
        <ChevronRight
            className={cn(
                "h-4",
                "w-4",
                "shrink-0",
                "text-muted-foreground",
                "transition-transform",
                "duration-200",
                "group-data-[state=open]:rotate-90",
                {
                    "rotate-180": dir === "rtl",
                }
            )}
        />
    );

    return (
        <Collapsible key={`collapsible-${name}`} className={cn("w-full", "group")}>
            <CollapsibleTrigger asChild>
                <SidebarButton item={item} rightIcon={chevronIcon} badgeMap={badgeMap} />
            </CollapsibleTrigger>

            <CollapsibleContent
                className={cn(
                    dir === "rtl" ? "mr-6" : "ml-6",
                    "flex",
                    "flex-col",
                    "gap-2"
                )}
            >
                {children?.map((child: TreeMenuItem) => (
                    <SidebarItem
                        key={child.key || child.name}
                        item={child}
                        selectedKey={selectedKey}
                        badgeMap={badgeMap}
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}

function SidebarItemDropdown({ item, selectedKey, badgeMap }: MenuItemProps) {
    const { children } = item;
    const Link = useLink();
    const { dir } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarButton item={item} badgeMap={badgeMap} />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side={dir === "rtl" ? "left" : "right"}
                align="start"
            >
                {children?.map((child: TreeMenuItem) => {
                    const { key: childKey } = child;
                    const isSelected = childKey === selectedKey;

                    return (
                        <DropdownMenuItem key={childKey || child.name} asChild>
                            <Link
                                to={child.route || ""}
                                className={cn("flex w-full items-center gap-2", {
                                    "bg-accent text-accent-foreground": isSelected,
                                    "flex-row-reverse text-right": dir === "rtl",
                                })}
                            >
                                <ItemIcon
                                    icon={child.meta?.icon ?? child.icon}
                                    isSelected={isSelected}
                                />
                                <span>{getDisplayName(child)}</span>
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SidebarItemLink({ item, selectedKey, badgeMap }: MenuItemProps) {
    const isSelected = item.key === selectedKey;

    return <SidebarButton item={item} isSelected={isSelected} asLink={true} badgeMap={badgeMap} />;
}

function SidebarHeader() {
    const { open } = useShadcnSidebar();
    const { dir } = useLanguage();
    const { t } = useTranslation();

    return (
        <ShadcnSidebarHeader
            className={cn(
                "p-0",
                "h-16",
                "border-b",
                "border-border",
                "flex-row",
                "items-center",
                "overflow-hidden"
            )}
        >
            <div
                className={cn(
                    "whitespace-nowrap",
                    "flex",
                    "h-full",
                    "items-center",
                    "gap-3",
                    "transition-discrete",
                    "duration-200",
                    "w-full",
                    dir === "rtl" ? "flex-row text-right" : "flex-row text-left",
                    {
                        "justify-start": dir !== "rtl",
                        "justify-end": dir === "rtl",
                        "pl-3": !open && dir !== "rtl",
                        "pl-5": open && dir !== "rtl",
                        "pr-3": !open && dir === "rtl",
                        "pr-5": open && dir === "rtl",
                    }
                )}
                dir={dir === "rtl" ? "ltr" : "ltr"}
            >
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
                    <img src={logo} alt="Snowball logo" className="h-8 w-8 object-contain" />
                </div>

                <div
                    className={cn("transition-opacity duration-200", dir === "rtl" && "text-right", {
                        "opacity-0": !open,
                        "opacity-100": open,
                    })}
                >
                    <h2 className="text-sm font-bold leading-none">{t("brand.name")}</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {t("brand.subtitle")}
                    </p>
                </div>
            </div>
        </ShadcnSidebarHeader>
    );
}

function getDisplayName(item: TreeMenuItem) {
    const rawLabel = item.meta?.label ?? item.label ?? item.name;

    if (typeof rawLabel !== "string") return rawLabel;

    const translated = i18n.t(rawLabel);
    return translated || rawLabel;
}

type IconProps = {
    icon: React.ReactNode;
    isSelected?: boolean;
};

function ItemIcon({ icon, isSelected }: IconProps) {
    return (
        <div
            className={cn("w-4", {
                "text-muted-foreground": !isSelected,
                "text-sidebar-primary-foreground": isSelected,
            })}
        >
            {icon ?? <ListIcon />}
        </div>
    );
}

type SidebarButtonProps = React.ComponentProps<typeof Button> & {
    item: TreeMenuItem;
    isSelected?: boolean;
    rightIcon?: React.ReactNode;
    asLink?: boolean;
    onClick?: () => void;
    badgeMap: Record<string, SidebarBadgeEntry>;
};

function SidebarButton({
    item,
    isSelected = false,
    rightIcon,
    asLink = false,
    className,
    onClick,
    badgeMap,
    ...props
}: SidebarButtonProps) {
    const Link = useLink();
    const { open } = useShadcnSidebar();
    const { dir } = useLanguage();

    const badge = useMemo(() => {
        const key = String(item.name ?? item.key ?? "");
        return badgeMap[key];
    }, [badgeMap, item.key, item.name]);

    const badgeNode = badge && badge.count > 0 ? (
        <Badge
            variant="outline"
            className={cn(
                "h-6 min-w-6 justify-center rounded-full px-1.5 text-[11px] font-semibold",
                severityClassMap[badge.severity],
                {
                    hidden: !open,
                }
            )}
        >
            {badge.count > 99 ? "99+" : badge.count}
        </Badge>
    ) : null;

    const iconNode = <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />;
    const labelNode = (
        <span
            className={cn("min-w-0 tracking-[-0.00875rem]", {
                "flex-1": rightIcon || badgeNode,
                "text-left": dir !== "rtl",
                "text-right": dir === "rtl",
                "line-clamp-1": !rightIcon,
                truncate: !rightIcon,
                "font-normal": !isSelected,
                "font-semibold": isSelected,
                "text-sidebar-primary-foreground": isSelected,
                "text-foreground": !isSelected,
            })}
        >
            {getDisplayName(item)}
        </span>
    );

    const buttonContent = (
        <>
            {iconNode}
            {labelNode}
            {badgeNode}
            {rightIcon}
        </>
    );

    return (
        <Button
            asChild={!!(asLink && item.route)}
            variant="ghost"
            size="lg"
            className={cn(
                "flex w-full items-center justify-start gap-2 py-2 !px-3 text-sm",
                dir === "rtl" && "text-right",
                {
                    "bg-sidebar-primary": isSelected,
                    "hover:!bg-sidebar-primary/90": isSelected,
                    "text-sidebar-primary-foreground": isSelected,
                    "hover:text-sidebar-primary-foreground": isSelected,
                },
                className
            )}
            onClick={onClick}
            {...props}
        >
            {asLink && item.route ? (
                <Link
                    to={item.route}
                    className={cn(
                        "flex w-full items-center gap-2",
                        dir === "rtl" && "text-right",
                    )}
                >
                    {buttonContent}
                </Link>
            ) : (
                buttonContent
            )}
        </Button>
    );
}
