import { useTheme } from '@/context/theme-context'
import { Toggle } from "@/components/ui/toggle"
import { SunIcon, MoonIcon } from 'lucide-react'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()


  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Toggle
      className='mx-1'
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Toggle>
  );
}
