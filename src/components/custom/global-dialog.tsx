"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DialogType = "info" | "success" | "warning" | "error" | "confirm";

interface DialogOptions {
  type?: DialogType;
  title?: ReactNode;
  message?: ReactNode;

  // 按钮文本
  okText?: string;
  cancelText?: string;

  // 是否显示按钮
  showOk?: boolean;
  showCancel?: boolean;

  // 是否显示 loading
  okLoading?: boolean;
  cancelLoading?: boolean;

  // 自定义内容（优先级最高）
  content?: ReactNode;

  // 自动关闭时间
  autoCloseMs?: number;
}

interface DialogState extends DialogOptions {
  id: number;
  open: boolean;
  resolve?: (value: any) => void;
}

const DialogCtx = createContext<{
  showDialog: (options: DialogOptions) => Promise<any>;
} | null>(null);

export const useGlobalDialog = () => useContext(DialogCtx)!;

export const GlobalDialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  const showDialog = useCallback((options: DialogOptions) => {
    return new Promise((resolve) => {
      const newDialog: DialogState = {
        id: Date.now(),
        open: true,
        type: "info",
        showOk: true,
        showCancel: false,
        okText: "确认",
        cancelText: "取消",
        ...options,
        resolve,
      };
      setDialogs((prev) => [...prev, newDialog]);
    });
  }, []);

  const close = (id: number, value: any) => {
    setDialogs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, open: false } : d))
    );

    const dlg = dialogs.find((d) => d.id === id);
    dlg?.resolve?.(value);

    setTimeout(() => {
      setDialogs((prev) => prev.filter((d) => d.id !== id));
    }, 200);
  };

  return (
    <DialogCtx.Provider value={{ showDialog }}>
      {children}

      {dialogs.map((dlg) => (
        <Dialog key={dlg.id} open={dlg.open} onOpenChange={() => close(dlg.id, false)}>
          <DialogContent>
            <DialogHeader>
              {dlg.title && <DialogTitle>{dlg.title}</DialogTitle>}
              {dlg.message && <DialogDescription>{dlg.message}</DialogDescription>}
            </DialogHeader>

            {dlg.content}

            <DialogFooter>
              {dlg.showCancel && (
                <Button
                  variant="outline"
                  disabled={dlg.cancelLoading}
                  onClick={() => close(dlg.id, false)}
                >
                  {dlg.cancelLoading ? "..." : dlg.cancelText}
                </Button>
              )}

              {dlg.showOk && (
                <Button
                  disabled={dlg.okLoading}
                  onClick={() => close(dlg.id, true)}
                >
                  {dlg.okLoading ? "..." : dlg.okText}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </DialogCtx.Provider>
  );
};