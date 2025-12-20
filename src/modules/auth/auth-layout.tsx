"use client";
import { Logo } from '@/assets/logo'
import { useRefineOptions } from '@refinedev/core';

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { title } = useRefineOptions();
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-6 flex items-center justify-center'>
          {title.icon}
          <h1 className='text-xl font-medium ml-1'>{title.text}</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
