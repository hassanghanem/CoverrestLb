import { useTranslation } from "react-i18next";
import { useLocation, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import i18n from "@/i18n";
import { RootState } from "@/lib/store/store";
import { navItems } from "@/constants/data";
import { Icons } from "../public/icons";

import SignOut from "../fields/SignOut";
import { TeamSwitcher } from "./team-switcher";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";

const NotificationDot = () => (
  <span className="mx-1 inline-block h-2 w-2 rounded-full bg-red-500" />
);

export default function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;

  const user = useSelector((state: RootState) => state.auth.user);
  const lang = i18n.language || "en";
  const isArabic = lang === "ar";
  const side = isArabic ? "right" : "left";
  const {
    unreadOrderCount,
    unreadPreorderCount,
    pendingReturnCount,
    unreadContactCount,
    unreadReviewCount,
  } = useNotifications();

  const totalOrderCount =
    unreadOrderCount + unreadPreorderCount + pendingReturnCount;

  return (
    <Sidebar collapsible="icon" side={side} className="min-h-screen border-e">
      <SidebarHeader>
        <TeamSwitcher teams={user?.teams} />
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>{t("Overview")}</SidebarGroupLabel>
          <SidebarMenu>
            {navItems
              .filter(
                (item) =>
                  !item.permission || user?.permissions.includes(item.permission)
              )
              .map((item) => {
                const Icon = item.icon ? Icons[item.icon as keyof typeof Icons] : Icons.logo;

                const isOrdersGroup = item.title === "Orders";
                const hasGroupNotification =
                  isOrdersGroup && totalOrderCount > 0;

                if (Array.isArray(item.items) && item.items.length > 0) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.items.some((sub) =>
                        pathname.startsWith(sub.url)
                      )}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={t(item.title)}
                            isActive={pathname === item.url}
                            className="relative flex items-center gap-2"
                          >
                            {Icon && <Icon className="size-5 shrink-0" />}
                            <span className="truncate flex-1 text-start">
                              {hasGroupNotification && <NotificationDot />}
                              {t(item.title)}
                            </span>
                            <ChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((sub) => {
                              const SubIcon = sub.icon
                                ? Icons[sub.icon as keyof typeof Icons]
                                : null;

                              const isOrders = sub.title === "Orders";
                              const isPreOrders = sub.title === "Pre Orders";
                              const isReturns = sub.title === "Return Orders";
                              const isReviews = sub.title === "Reviews";
                              const hasSubNotification =
                                (isOrders && unreadOrderCount > 0) ||
                                (isPreOrders && unreadPreorderCount > 0) ||
                                (isReturns && pendingReturnCount > 0) ||
                                (isReviews && unreadReviewCount > 0);

                              return (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === sub.url}
                                  >
                                    <NavLink
                                      to={sub.url}
                                      className="flex items-center gap-2"
                                    >
                                      {SubIcon && (
                                        <SubIcon className="size-4" />
                                      )}
                                      <span className="flex-1 overflow-hidden whitespace-nowrap truncate">
                                        {hasSubNotification && (
                                          <NotificationDot />
                                        )}
                                        {t(sub.title)}
                                      </span>
                                      <DropdownMenuShortcut>
                                        {sub.shortcut}
                                      </DropdownMenuShortcut>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const hasNotification =
                  (item.title === "Contacts" && unreadContactCount > 0) ||
                  (item.title === "Reviews" && unreadReviewCount > 0);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={t(item.title)}
                      isActive={pathname === item.url}
                      className="relative flex items-center gap-2"
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-2"
                      >
                        <Icon className="size-5" />
                        <span className="flex-1 truncate text-start">
                          {hasNotification && <NotificationDot />}
                          {t(item.title)}
                        </span>
                        <DropdownMenuShortcut>
                          {item.shortcut}
                        </DropdownMenuShortcut>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                    <AvatarFallback>
                      {user?.name?.slice(0, 2)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate text-start">
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="top"
                sideOffset={6}
                className="min-w-56"
              >
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback>
                        {user?.name?.slice(0, 2)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <SignOut />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
