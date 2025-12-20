export const PERMISSIONS = {
    SYS_CONFIG: {
        MODULE: "sys_config",
        ACTIONS: {
            VIEW: "sys_config:view",
            CREATE: "sys_config:create",
            EDIT: "sys_config:edit",
            DELETE: "sys_config:delete",
        },
    },
    ACCOUNT: {
        MODULE: "account",
        ACTIONS: {
            VIEW: "account:view",
            CREATE: "account:create",
            EDIT: "account:edit",
            DELETE: "account:delete",
        }
    },
    ROLE: {
        MODULE: "role",
        ACTIONS: {
            VIEW: "role:view",
            CREATE: "role:create",
            EDIT: "role:edit",
            DELETE: "role:delete",
        }
    },
    CUSTOMER: {
        MODULE: "customer",
        ACTIONS: {
            VIEW: "customer:view",
            CREATE: "customer:create",
            EDIT: "customer:edit",
            DELETE: "customer:delete",
        }
    },
    STRATEGY: {
        MODULE: "strategy",
        ACTIONS: {
            VIEW: "strategy:view",
            CREATE: "strategy:create",
            EDIT: "strategy:edit",
            DELETE: "strategy:delete",
        }
    }
} as const;

export type PermissionModule = keyof typeof PERMISSIONS;
