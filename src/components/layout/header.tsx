"use client";
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '../ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize);
    }
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
          fixed &&
          'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        {
          isMobile && <SidebarTrigger variant='outline' className='max-md:scale-125' />
        }

        {/* <Separator orientation='vertical' className='h-6' /> */}
        {children}
      </div>
    </header>
  )
}
