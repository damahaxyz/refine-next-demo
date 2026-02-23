import { toast } from "sonner";
import { ImageObject } from "../../types";

export function useImageClipboard() {
    const handleCopy = (value: ImageObject | null | undefined, isStrong: boolean) => {
        if (!value) return;
        try {
            const clipboardData: ImageObject = { ...value };
            if (isStrong) {
                // Strong copy: regenerate a new unique ID, so crops won't synchronize with the source
                clipboardData.id = crypto.randomUUID();
            }
            localStorage.setItem("_refine_next_img_clipboard", JSON.stringify(clipboardData));
            toast.success(isStrong ? "强复制成功" : "软复制成功", {
                description: "图片已保存至剪贴板",
            });
        } catch (e) {
            console.error("Copy failed", e);
            toast.error("复制失败", {
                description: "保存图片数据到剪贴板时出错",
            });
        }
    };

    const handlePaste = (onChange?: (value?: ImageObject | null) => void) => {
        try {
            const dataStr = localStorage.getItem("_refine_next_img_clipboard");
            if (dataStr && onChange) {
                const imgData = JSON.parse(dataStr) as ImageObject;
                onChange(imgData);
                toast.success("粘贴成功");
            } else {
                toast.error("粘贴失败", {
                    description: "剪贴板中没有可用的图片数据",
                });
            }
        } catch (e) {
            console.error("Paste failed", e);
            toast.error("粘贴失败", {
                description: "读取剪贴板数据时发生错误",
            });
        }
    };

    return {
        handleCopy,
        handlePaste
    };
}
