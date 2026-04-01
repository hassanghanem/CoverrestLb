import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Team } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

export function TeamSwitcher({ teams }: { teams?: Team[] }) {
  const { isMobile } = useSidebar();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const teamIdFromCookie = localStorage.getItem("X-Team-ID");

  const defaultTeam =
    teams?.find((team) => team.id.toString() === teamIdFromCookie) ||
    teams?.[0];

  const [activeTeam, setActiveTeam] = React.useState<Team | undefined>(
    defaultTeam
  );

  const handleTeamSwitch = (team: Team) => {
    setActiveTeam(team);
    localStorage.setItem("X-Team-ID", team.id.toString());
    queryClient.invalidateQueries();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label={t("Switch team")}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground overflow-hidden">
                <img
                  src="/assets/logo.png"
                  alt={activeTeam?.name}
                  className="size-6"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam?.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("Branches")}
            </DropdownMenuLabel>

            {(teams ?? []).map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamSwitch(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                  <img
                    src="/assets/logo.png"
                    alt={team.name}
                    className="size-4 shrink-0"
                  />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
