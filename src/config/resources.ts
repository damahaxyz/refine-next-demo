
export const resources = [
    {
        name: "dashboard",
        list: "/admin/dashboard",
    },
    {
        name: "accounts",
        list: "/admin/accounts"
    },
    {
        name: "roles",
        list: "/admin/roles"
    },
    {
        name: "system_configs",
        list: "/admin/system_configs",
    },
    {
        name: "products",
        list: "/admin/products",
        edit: "/admin/products/:id/edit",
        show: "/admin/products/:id",
        meta: {
            label: "商品管理",
        }
    },

]