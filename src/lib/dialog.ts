import { useGlobalDialog } from "@/components/custom/global-dialog";

export const GlobalDialog = {
  info: (title: any, message?: any, opt = {}) =>
    window.__dialog_show?.({ type: "info", title, message, ...opt }),

  success: (title: any, message?: any, opt = {}) =>
    window.__dialog_show?.({ type: "success", title, message, ...opt }),

  warning: (title: any, message?: any, opt = {}) =>
    window.__dialog_show?.({ type: "warning", title, message, ...opt }),

  error: (title: any, message?: any, opt = {}) =>
    window.__dialog_show?.({ type: "error", title, message, ...opt }),

  confirm: (title: any, message?: any, opt = {}) =>
    window.__dialog_show?.({
      type: "confirm",
      title,
      message,
      showCancel: true,
      ...opt,
    }),

  // 完全自定义
  custom: (options: any) =>
    window.__dialog_show?.({
      showOk: false,
      showCancel: false,
      ...options,
    }),
};

// 桥接 Hook
export const DialogProviderBridge = () => {
  const { showDialog } = useGlobalDialog();
  if (typeof window !== "undefined") {
    window.__dialog_show = showDialog;
  }
  return null;
};

declare global {
  interface Window {
    __dialog_show?: (options: any) => Promise<any>;
  }
}