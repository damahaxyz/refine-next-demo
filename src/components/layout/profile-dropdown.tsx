import Link from "next/link"
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/layout/sign-out-dialog'
import { useGetIdentity } from '@refinedev/core'
import { ChangePasswordDialog } from './change-password-dialog'
import { AccountProfileDialog } from './account-profile-dialog'
import { Badge } from '../ui/badge'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState();
  const [changePwdOpen, setChangePwdOpen] = useDialogState();
  const [profileOpen, setProfileOpen] = useDialogState();

  const { data: user } = useGetIdentity();


  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt='@trade-system' />
              <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{user?.name} <span className='text-muted-foreground text-xs leading-none'>({user?.username})</span></p>
              <div className='text-muted-foreground text-xs leading-none flex space-x-1 items-center'>
                <span>角色:</span>
                {
                  user?.roles?.map((item: string) => <span className='text-xs px-1'>{item}</span>)
                }
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              账户信息
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChangePwdOpen(true)}>
              修改密码
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            注销
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AccountProfileDialog open={!!profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog open={!!changePwdOpen} onOpenChange={setChangePwdOpen} />
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
