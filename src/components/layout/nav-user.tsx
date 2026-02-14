import Link from "next/link"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/layout/sign-out-dialog'
import { useGetIdentity } from '@refinedev/core'
import { ChangePasswordDialog } from './change-password-dialog'
import { AccountProfileDialog } from './account-profile-dialog'

type NavUserProps = {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState();
  const [changePwdOpen, setChangePwdOpen] = useDialogState();
  const [profileOpen, setProfileOpen] = useDialogState();
  const { data: user } = useGetIdentity();
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={"/avatars/01.png"} alt={user?.username} />
                  <AvatarFallback className='rounded-lg'>{user?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user?.realName}</span>
                  <span className='truncate text-xs'>{user?.accountId}</span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={"/avatars/01.png"} alt={user?.avatar} />
                    <AvatarFallback className='rounded-lg'>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{user?.name}</span>
                    <span className='truncate text-xs'>{user?.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <BadgeCheck />
                  账户信息
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChangePwdOpen(true)}>
                  <CreditCard />
                  修改密码
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <LogOut />
                注销
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AccountProfileDialog open={!!profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog open={!!changePwdOpen} onOpenChange={setChangePwdOpen} />
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
