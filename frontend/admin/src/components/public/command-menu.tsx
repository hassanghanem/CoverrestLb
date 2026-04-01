import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { IconMoon, IconSun, IconSearch } from "@tabler/icons-react";

import { RootState } from "@/lib/store/store";
import { navItems, profileDropdownItems } from "@/constants/data";
import { useTheme } from "@/context/theme-context";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

export function CommandMenu() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  const [open, setOpen] = React.useState(false);

  // Handle navigation smoothly
  const handleNavigate = (url: string) => {
    navigate(url);
    setOpen(false);

  };

  const handleThemeChange = (theme: "light" | "dark") => {
    setTheme(theme);
    setOpen(false);

  };

  // Filter nav items without mutating original data
  const filteredNavItems = navItems
    .map((item) => {
      if (item.permission && !user?.permissions.includes(item.permission)) return null;
      if (item.items?.length) {
        const filteredSubItems = item.items.filter(
          (sub) => !sub.permission || user?.permissions.includes(sub.permission)
        );
        if (filteredSubItems.length === 0) return null;
        return { ...item, items: filteredSubItems };
      }
      return item;
    })
    .filter(Boolean) as typeof navItems;

  const filteredProfileItems = profileDropdownItems.filter(
    (item) => user?.permissions.includes(item.permission)
  );

  // Open with ⌘/Ctrl + K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* Search button */}
      <div className="hidden md:flex mx-3">
        <Button
          variant="outline"
          className="relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50 sm:pr-12 md:w-40 md:flex-none lg:w-56 xl:w-64"
          onClick={() => setOpen(true)}
        >
          <IconSearch
            className={`absolute top-1/2 -translate-y-1/2 ${dir === "rtl" ? "right-1.5" : "left-1.5"}`}
          />
          <span className={`${dir === "rtl" ? "mr-3" : "ml-3"}`}>{t("Search")}</span>
          <kbd
            className={`pointer-events-none absolute hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex ${
              dir === "rtl" ? "left-[0.3rem]" : "right-[0.3rem]"
            } top-[0.3rem]`}
          >
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Command dialog */}
      <CommandDialog modal open={open} onOpenChange={setOpen}>
        <CommandInput autoFocus placeholder={t("Type a command or search")} />
        <CommandList>
          <ScrollArea>
            <CommandEmpty>{t("No results found")}</CommandEmpty>

            <CommandGroup heading={<span className="w-full block">{t("Overview")}</span>}>
              {filteredNavItems.map((navItem, i) =>
                navItem.url && navItem.url !== "#" ? (
                  <CommandItem
                    key={`${navItem.url}-${i}`}
                    onSelect={() => handleNavigate(navItem.url)}
                    className="place-content-between"
                  >
                    {t(navItem.title)}
                  </CommandItem>
                ) : (
                  navItem.items?.map((subItem, j) => (
                    <CommandItem
                      key={`${subItem.url}-${j}`}
                      onSelect={() => handleNavigate(subItem.url)}
                      className="place-content-between"
                    >
                      {t(subItem.title)}
                    </CommandItem>
                  ))
                )
              )}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={<span className="w-full block">{t("Profile")}</span>}>
              {filteredProfileItems.map((profileItem, i) => (
                <CommandItem
                  key={`${profileItem.to}-${i}`}
                  onSelect={() => handleNavigate(profileItem.to)}
                  className="place-content-between"
                >
                  {t(profileItem.translationKey)}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={<span className="w-full block">{t("Toggle theme")}</span>}>
              <CommandItem className="place-content-between" onSelect={() => handleThemeChange("light")}>
                <IconSun />
                <span>{t("Set light theme")}</span>
              </CommandItem>
              <CommandItem className="place-content-between" onSelect={() => handleThemeChange("dark")}>
                <IconMoon className="scale-90" />
                <span>{t("Set dark theme")}</span>
              </CommandItem>
            </CommandGroup>
          </ScrollArea>
        </CommandList>
      </CommandDialog>
    </>
  );
}
