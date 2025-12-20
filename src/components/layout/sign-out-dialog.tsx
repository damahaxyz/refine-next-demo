import { ConfirmDialog } from '@/components/custom/confirm-dialog'
import { useLogout } from '@refinedev/core'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { mutate: logout } = useLogout();

  const handleSignOut = () => {
    logout({}, {
      onSuccess: () => {
        onOpenChange(false)
        window.location.href = "/login"
      }
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
