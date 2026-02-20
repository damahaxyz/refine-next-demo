
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Tag, FolderTree } from "lucide-react";
import { useNotification, useCustomMutation } from "@refinedev/core";
import { Shop } from "./types";
import { useState } from "react";

interface ShopMetaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shop: Shop | null;
}

export function ShopMetaDialog({ open, onOpenChange, shop }: ShopMetaDialogProps) {
    const { open: openNotification } = useNotification();
    const [isSyncing, setIsSyncing] = useState(false);
    const { mutate } = useCustomMutation();

    if (!shop) return null;

    const handleSync = () => {
        setIsSyncing(true);
        mutate(
            {
                url: `/api/shops/${shop.id}/sync-meta`,
                method: "post",
                values: {},
            },
            {
                onSuccess: (data: any) => {
                    setIsSyncing(false);
                    openNotification?.({
                        type: "success",
                        message: "分类和标签同步成功",
                    });
                    // In a real app we might want to refresh the list or refetch this specific shop
                    // Currently relying on parent refresh or manual reload if immediate update needed
                    // Or we could use invalidate form Refine
                    window.location.reload(); // Simple brute force refresh for now to see changes
                },
                onError: (error: any) => {
                    setIsSyncing(false);
                    openNotification?.({
                        type: "error",
                        message: "元数据同步失败",
                        description: error?.message || "请检查 API 凭证",
                    });
                },
            }
        );
    };

    const categories = (shop.categories as any[]) || [];
    const tags = (shop.tags as any[]) || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{shop.name} - 数据管理</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSync}
                            disabled={isSyncing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "同步中..." : "从 WooCommerce 同步"}
                        </Button>
                    </DialogTitle>
                    <DialogDescription>
                        查看并同步已连接商店的分类和标签。
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 mt-4">
                    {/* Categories Column */}
                    <div className="border rounded-md flex flex-col overflow-hidden">
                        <div className="bg-muted p-2 text-sm font-semibold flex items-center">
                            <FolderTree className="w-4 h-4 mr-2" /> 分类 ({categories.length})
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-1">
                                {categories.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic">暂无分类数据</div>
                                ) : (
                                    categories.map((cat: any) => (
                                        <div key={cat.id} className="flex items-center text-sm py-1">
                                            <span className="text-muted-foreground mr-2 font-mono text-xs">#{cat.id}</span>
                                            {cat.name}
                                            {cat.parent && cat.parent !== 0 && (
                                                <span className="ml-2 text-xs text-muted-foreground">(父级: {cat.parent})</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Tags Column */}
                    <div className="border rounded-md flex flex-col overflow-hidden">
                        <div className="bg-muted p-2 text-sm font-semibold flex items-center">
                            <Tag className="w-4 h-4 mr-2" /> 标签 ({tags.length})
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="flex flex-wrap gap-2">
                                {tags.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic w-full">暂无标签数据</div>
                                ) : (
                                    tags.map((tag: any) => (
                                        <Badge key={tag.id} variant="secondary" className="font-normal">
                                            {tag.name}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
