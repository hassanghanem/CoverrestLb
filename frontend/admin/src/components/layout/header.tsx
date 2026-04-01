
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import LocaleSwitcher from "../fields/LocaleSwitcher";
import { ProfileDropdown } from "../fields/profile-dropdown";
import { ThemeSwitch } from "../fields/theme-switch";
import { Breadcrumbs } from "../public/breadcrumbs";
import { NotificationsDropdown } from "../public/NotificationsDropdown";
import { CommandMenu } from "../public/command-menu";


export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 mr-4">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2 px-4">
        <CommandMenu />
        <LocaleSwitcher />
        <ThemeSwitch />
        <NotificationsDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
