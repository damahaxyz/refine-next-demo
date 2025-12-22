"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useCustom, useList } from "@refinedev/core";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";

export interface PermissionNode {
    code: string;
    name: string;
    type: "MODULE" | "ACTION";
    children: PermissionNode[];
}

interface PermissionTreeProps {
    value: string[];
    onChange: (v: string[]) => void;
}

export const PermissionTree: React.FC<PermissionTreeProps> = ({
    value,
    onChange,
}) => {
    /** ======================
     *   1. 加载权限树
     ======================= */
    // 使用 useCustom 而不是 useList，因为返回的是对象结构而非数组
    const { result: response, query: { isLoading } } = useList({
        resource: "permissions",
        pagination: { mode: "off" },
    });

    // 转换数据结构
    const treeData = useMemo(() => {
        // response.data 是 API 返回的完整 JSON { code: 0, data: [...] }
        const rawData = response?.data || [];

        if (!Array.isArray(rawData)) return [];

        return rawData.map((moduleDef: any) => {
            // moduleDef = { MODULE: "sys_config", ACTIONS: { VIEW: "...", ... } }

            const children = Object.keys(moduleDef.ACTIONS || {}).map((actionKey) => ({
                code: moduleDef.ACTIONS[actionKey],
                name: actionKey, // "VIEW", "CREATE"
                type: "ACTION" as const,
                children: [],
            }));

            // Generate a readable name from MODULE code (e.g. "sys_config" -> "Sys Config" or just Uppercase)
            const moduleName = moduleDef.NAME;

            return {
                code: moduleDef.MODULE,
                name: moduleName,
                type: "MODULE" as const,
                children: children,
            };
        });
    }, [response]);

    /** ======================
     *   2. 全局展开/折叠
     ======================= */
    const [expandAllVersion, setExpandAllVersion] = useState(0);

    /** ======================
     *   3. 单个节点展开状态
     ======================= */
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    const toggleExpand = useCallback((code: string) => {
        setExpandedMap((prev) => ({
            ...prev,
            [code]: !prev[code],
        }));
    }, []);

    const setAllExpanded = (expanded: boolean) => {
        setExpandedMap({});
        setExpandAllVersion((v) => v + (expanded ? 1 : -1));
    };

    /** ======================
     *   4. 计算选中状态
     ======================= */
    const calcNodeState = useCallback(
        (node: PermissionNode): { checked: boolean; indeterminate: boolean } => {
            if (!node.children?.length) {
                return {
                    checked: value.includes(node.code),
                    indeterminate: false,
                };
            }

            const childStates = node.children.map(calcNodeState);
            const allChecked = childStates.every((s) => s.checked);
            const someChecked = childStates.some(
                (s) => s.checked || s.indeterminate,
            );

            return {
                checked: allChecked,
                indeterminate: someChecked && !allChecked,
            };
        },
        [value],
    );

    /** ======================
     *   5. 勾选处理（父子联动）
     ======================= */
    const toggleNode = useCallback(
        (node: PermissionNode, checked: boolean) => {
            const collectCodes = (n: PermissionNode): string[] => n.type === "ACTION" ? [
                n.code,
                ...n.children.flatMap(collectCodes),
            ] : [
                ...n.children.flatMap(collectCodes)
            ];

            const codes = collectCodes(node);

            const newValue = checked
                ? Array.from(new Set([...value, ...codes]))
                : value.filter((v) => !codes.includes(v));

            onChange(newValue);
        },
        [value, onChange],
    );

    /** ======================
     *   6. useMemo 渲染树
     ======================= */
    const memoizedTree = useMemo(() => {
        if (isLoading) return <div>Loading...</div>;

        const renderNode = (node: PermissionNode, level = 0) => {
            const hasChildren = node.children?.length > 0;
            const expanded = expandedMap[node.code] ?? expandAllVersion > 0;
            const { checked, indeterminate } = calcNodeState(node);

            return (
                <div key={node.code}>
                    <div
                        className="flex items-center gap-2 py-1 select-none"
                        style={{ paddingLeft: level * 16 }}
                    >
                        {/* 展开/折叠箭头 */}
                        {hasChildren ? (
                            expanded ? (
                                <ChevronDown
                                    size={16}
                                    className="cursor-pointer opacity-70 hover:opacity-100"
                                    onClick={() => toggleExpand(node.code)}
                                />
                            ) : (
                                <ChevronRight
                                    size={16}
                                    className="cursor-pointer opacity-70 hover:opacity-100"
                                    onClick={() => toggleExpand(node.code)}
                                />
                            )
                        ) : (
                            <div style={{ width: 16 }}></div>
                        )}

                        {/* 复选框 */}
                        <Checkbox
                            checked={indeterminate ? "indeterminate" : checked}
                            onCheckedChange={(c) =>
                                toggleNode(node, Boolean(c))
                            }
                        />

                        {/* 标题 */}
                        <span className="font-manrope text-sm">{node.name}</span>
                        <span className="text-xs opacity-40">{node.type}</span>
                    </div>

                    {/* 子节点 */}
                    {hasChildren && expanded && (
                        <div>{node.children.map((c) => renderNode(c, level + 1))}</div>
                    )}
                </div>
            );
        };

        return <>{treeData.map((n) => renderNode(n))}</>;
    }, [
        treeData,
        value,
        expandedMap,
        expandAllVersion,
        isLoading,
        calcNodeState,
        toggleNode,
        toggleExpand,
    ]);

    /** ======================
     *   7. 全局控制按钮
     ======================= */
    return (
        <div className="space-y-4">
            <div>{memoizedTree}</div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={(event) => { event.preventDefault(); setAllExpanded(true) }}>
                    展开全部
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={(event) => { event.preventDefault(); setAllExpanded(false) }}>
                    折叠全部
                </Button>
            </div>


        </div>
    );
};
