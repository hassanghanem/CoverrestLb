
import { IconMenu } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[]
}

export function TopNav({  }: TopNavProps) {
  return (

    <div className='md:hidden'>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='outline'>
            <IconMenu />
          </Button>
        </DropdownMenuTrigger>

      </DropdownMenu>
    </div>

  )
}
