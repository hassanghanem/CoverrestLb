// ThemeToggle.tsx
import { useTheme } from '@/context/theme-context'
import { Toggle } from "@/components/ui/toggle"
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react'
type Theme = 'dark' | 'light' | 'system'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case 'dark':
        return <MoonIcon className="h-4 w-4" />
      case 'light':
        return <SunIcon className="h-4 w-4" />
      case 'system':
        return <MonitorIcon className="h-4 w-4" />
      default:
        return <MonitorIcon className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Switch to light theme'
      case 'light':
        return 'Switch to system theme'
      case 'system':
        return 'Switch to dark theme'
      default:
        return 'Toggle theme'
    }
  }

  return (
    <Toggle
      className='mx-1'
      aria-label={getLabel()}
      onClick={toggleTheme}
      title={getLabel()}
    >
      {getIcon()}
    </Toggle>
  )
}