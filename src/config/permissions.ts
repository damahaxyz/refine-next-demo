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
    CUSTOMER: {
        MODULE: "customer",
        NAME: "客户管理",
        ACTIONS: {
            VIEW: "customer:view",
            CREATE: "customer:create",
            EDIT: "customer:edit",
            DELETE: "customer:delete",
        }
    },
    STRATEGY: {
        MODULE: "strategy",
        NAME: "策略管理",
        ACTIONS: {
            VIEW: "strategy:view",
            CREATE: "strategy:create",
            EDIT: "strategy:edit",
            DELETE: "strategy:delete",
        }
    }
} as const;

export type PermissionModule = keyof typeof PERMISSIONS;
