import { prisma } from "@/lib/prisma-db";

export async function getAllPermissions(): Promise<string[]> {
    const { PERMISSIONS } = await import("@/config/permissions");
    const permissions = Object.values(PERMISSIONS).flat();
    let allPermissionStr = permissions.map(module => {
        return Object.values(module.ACTIONS).flat();
    });
    return allPermissionStr.flat();
}

export async function getUserPermissions(userId: string): Promise<string[]> {
    const account = await prisma.account.findUnique({
        where: { id: userId }
    });

    if (!account) return [];
    if (account.username === "root") return await getAllPermissions();

    // Parse roleIds safely
    const roleIds = (account.roleIds as string[]) || [];

    // Fetch roles
    // Prisma doesn't support $or with mixed ID/Name in a single simple way for unrelated fields easily without careful OR construction
    // But here we want roles where ID is in roleIds OR Name is in roleIds
    const roles = await prisma.role.findMany({
        where: {
            OR: [
                { id: { in: roleIds } },
                { name: { in: roleIds } }
            ]
        }
    });

    // Aggregate permissions
    const permissions = new Set<string>();

    // Add role permissions
    roles.forEach(role => {
        const rolePerms = (role.permissions as string[]) || [];

        if (rolePerms && Array.isArray(rolePerms)) {
            rolePerms.forEach((p: string) => permissions.add(p));
        }
    });

    // Add extra permissions
    const extraPerms = (account.extraPermissions as string[]) || [];

    if (extraPerms && Array.isArray(extraPerms)) {
        extraPerms.forEach((p: string) => permissions.add(p));
    }

    return Array.from(permissions);
}
