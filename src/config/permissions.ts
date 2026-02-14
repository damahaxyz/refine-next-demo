export const PERMISSIONS = {
    SYSTEM_CONFIG: {
        MODULE: "system_config",
        NAME: "系统配置",
        ACTIONS: {
            VIEW: "system_config:view",
            CREATE: "system_config:create",
            EDIT: "system_config:edit",
            DELETE: "system_config:delete",
        },
    },
    ACCOUNT: {
        MODULE: "account",
        NAME: "账户管理",
        ACTIONS: {
            VIEW: "account:view",
            CREATE: "account:create",
            EDIT: "account:edit",
            DELETE: "account:delete",
        }
    },
    ROLE: {
        MODULE: "role",
        NAME: "角色管理",
        ACTIONS: {
            VIEW: "role:view",
            CREATE: "role:create",
            EDIT: "role:edit",
            DELETE: "role:delete",
        }
    },
    PRODUCT: {
        MODULE: "product",
        NAME: "商品管理",
        ACTIONS: {
            VIEW: "product:view",
            CREATE: "product:create",
            EDIT: "product:edit",
            DELETE: "product:delete",
        }
    },
    SHOP: {
        MODULE: "shop",
        NAME: "店铺管理",
        ACTIONS: {
            VIEW: "shop:view",
            CREATE: "shop:create",
            EDIT: "shop:edit",
            DELETE: "shop:delete",
        }
    },
    COLLECTOR_TOKEN: {
        MODULE: "collector_token",
        NAME: "采集Token",
        ACTIONS: {
            VIEW: "collector_token:view",
            CREATE: "collector_token:create",
            EDIT: "collector_token:edit",
            DELETE: "collector_token:delete",
        }
    },
    TRANSLATION_CONFIG: {
        MODULE: "translation_config",
        NAME: "翻译配置",
        ACTIONS: {
            VIEW: "translation_config:view",
            CREATE: "translation_config:create",
            EDIT: "translation_config:edit",
            DELETE: "translation_config:delete",
        }
    },

} as const;

export type PermissionModule = keyof typeof PERMISSIONS;
