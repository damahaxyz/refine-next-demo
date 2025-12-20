"use client";
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type DialogType = string

type PageActionContextType<T> = {
  open: DialogType | null
  setOpen: (str: DialogType | null) => void
  currentRow: T | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
}

const PageActionContext = React.createContext<PageActionContextType<any> | null>(null)

export function PageActionProvider<T>({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<T | null>(null)

  return (
    <PageActionContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PageActionContext.Provider>
  )
}

export function usePageAction<T>() {
  const actionContext = React.useContext(PageActionContext)

  if (!actionContext) {
    throw new Error('usePageAction has to be used within <PageActionProvider>')
  }

  return actionContext as PageActionContextType<T>
}
