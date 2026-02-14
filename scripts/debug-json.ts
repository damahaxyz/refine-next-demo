
import { prisma } from '../src/lib/prisma-db';

async function main() {
    console.log('--- Checking Accounts ---');
    const accounts = await prisma.account.findMany();
    accounts.forEach(acc => {
        console.log(`Account: ${acc.username}`);
        console.log(`  roleIds type: ${typeof acc.roleIds}, isArray: ${Array.isArray(acc.roleIds)}, value:`, acc.roleIds);
        console.log(`  extraPerms type: ${typeof acc.extraPermissions}, isArray: ${Array.isArray(acc.extraPermissions)}, value:`, acc.extraPermissions);
    });

    console.log('\n--- Checking Roles ---');
    const roles = await prisma.role.findMany();
    roles.forEach(role => {
        console.log(`Role: ${role.name}`);
        console.log(`  permissions type: ${typeof role.permissions}, isArray: ${Array.isArray(role.permissions)}, value:`, role.permissions);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // await prisma.$disconnect();
    });
