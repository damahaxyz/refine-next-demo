import Account from "@/models/account";
import Role from "@/models/role";
import dbConnect from "@/lib/db";

export async function getAllPermissions(): Promise<string[]> {
    const { PERMISSIONS } = await import("@/config/permissions");
    const permissions = Object.values(PERMISSIONS).flat();
    let allPermissionStr = permissions.map(module => {
        return Object.values(module.ACTIONS).flat();
    });
    return allPermissionStr.flat();
}

export async function getUserPermissions(userId: string): Promise<string[]> {
    await dbConnect();

    const account = await Account.findById(userId);
    if (!account) return [];
    if (account.username === "root") return await getAllPermissions();
    // Fetch roles
    const roles = await Role.find({
        $or: [
            { _id: { $in: account.roleIds } },
            { name: { $in: account.roleIds } }
        ]
    });

    // Aggregate permissions
    const permissions = new Set<string>();

    // Add role permissions
    roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach((p: string) => permissions.add(p));
        }
    });

    // Add extra permissions
    if (account.extraPermissions && Array.isArray(account.extraPermissions)) {
        account.extraPermissions.forEach((p: string) => permissions.add(p));
    }

    return Array.from(permissions);
}
