import { CanParams, CanResponse, IAccessControlContext } from "@refinedev/core";
import pluralize from "pluralize";

const ALL_PERMISSION_FOR_ROOT = true;

export const accessControlProvider = {
  can: async ({ resource, action, params }: CanParams): Promise<CanResponse> => {
    if (!resource) {
      return { can: false };
    }
    if (resource == "ANY") {
      return { can: true }
    }
    if (typeof window === "undefined") return { can: false };
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (ALL_PERMISSION_FOR_ROOT && user.username == "root") {
      return { can: true }
    }
    const permissions = user.resources || [];
    const permissionCode = `${pluralize.singular(resource)}-${action}`.toUpperCase();
    return {
      can: permissions.includes(permissionCode),
    };
  },
  canMenuShow: (menuGroup: any): CanResponse => {
    if (typeof window === "undefined") return { can: false };
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (ALL_PERMISSION_FOR_ROOT && user.username == "root") {
      return { can: true }
    }
    const permissions = user.resources || [];
    const isLeaf = (menu: any) => menu.items ? false : true;
    const collectPermissions = (menu: any): Array<any> => {
      if (isLeaf(menu)) {
        return [menu.permission || "ANY"]; //ANY 表示任何权限都能访问
      } else {
        return [...menu.items.map((sub: any) => collectPermissions(sub))]
      }
    }
    const groupPermissions = collectPermissions(menuGroup).flat(Infinity);

    for (let i = 0; i < groupPermissions.length; i++) {
      const permissionCode = groupPermissions[i];
      if (permissionCode === "ANY" || permissions.includes(permissionCode)) {
        return { can: true }
      }
    }

    return { can: false, };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: true,
    },
    queryOptions: {
      // ... default global query options
    },
  },
};