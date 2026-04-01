import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SignOut from "./SignOut";
import { useTranslation } from "react-i18next";
import { profileDropdownItems } from "@/constants/data";

export function ProfileDropdown() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const hasPermission = (permission: string) => user?.permissions?.includes(permission);

  const visibleItems = profileDropdownItems.filter(item => hasPermission(item.permission));
  const showDropdownGroup = visibleItems.length > 0;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full mx-1">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="rounded-lg">
              {user?.name?.slice(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        {showDropdownGroup && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {visibleItems.map(item => (
                <DropdownMenuItem asChild key={item.to}>
                  <Link to={item.to}>
                    {t(item.translationKey)}
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <SignOut />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
