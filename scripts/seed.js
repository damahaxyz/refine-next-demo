const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || "file:./dev.db";
const dbPath = connectionString.replace("file:", "");

const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log('Starting database seeding...');

        // 1. Create Default Role (Admin)
        const adminRoleName = 'admin';
        let adminRole = await prisma.role.findFirst({ where: { name: adminRoleName } });

        if (!adminRole) {
            console.log(`Creating role '${adminRoleName}'...`);
            adminRole = await prisma.role.create({
                data: {
                    name: adminRoleName,
                    permissions: ['*'] // All permissions
                }
            });
            console.log(`Role '${adminRoleName}' created.`);
        } else {
            console.log(`Role '${adminRoleName}' already exists. Updating permissions...`);
            adminRole = await prisma.role.update({
                where: { id: adminRole.id },
                data: {
                    permissions: ['*']
                }
            });
            console.log(`Role '${adminRoleName}' permissions updated.`);
        }

        // 2. Create Root User
        const username = 'root';
        const password = 'root123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.account.findUnique({ where: { username } });

        if (existingUser) {
            console.log("User 'root' already exists. Updating password and permissions...");
            const hashedPassword = await bcrypt.hash('123456', 10);
            await prisma.account.update({
                where: { id: existingUser.id },
                data: {
                    password: hashedPassword,
                    roleIds: [adminRole.id], // Ensure native array
                    extraPermissions: ['*']  // Ensure native array
                }
            });
            console.log("User 'root' updated.");
        } else {
            console.log(`Creating user '${username}'...`);
            await prisma.account.create({
                data: {
                    username,
                    password: hashedPassword,
                    name: 'Root Administrator',
                    roleIds: [adminRole.id],
                    extraPermissions: ['*']
                }
            });
            console.log(`User '${username}' created.`);
        }

        // 3. Create System Configuration (Example)
        const configs = [
            { key: 'site_name', value: 'Refine Demo', name: 'Site Name', desc: 'The name of the application' },
            { key: 'maintenance_mode', value: 'false', name: 'Maintenance Mode', desc: 'Enable/Disable maintenance mode' }
        ];

        for (const config of configs) {
            const existingConfig = await prisma.systemConfig.findUnique({ where: { key: config.key } });
            if (!existingConfig) {
                await prisma.systemConfig.create({ data: config });
                console.log(`Config '${config.key}' created.`);
            } else {
                console.log(`Config '${config.key}' already exists.`);
            }
        }

        // 4. Create Demo Customer
        const demoCustomerName = 'Demo Customer';
        const demoCustomer = await prisma.customer.findFirst({ where: { name: demoCustomerName } });
        if (!demoCustomer) {
            await prisma.customer.create({
                data: {
                    name: demoCustomerName,
                    remark: 'Created by seed script'
                }
            });
            console.log(`Customer '${demoCustomerName}' created.`);
        } else {
            console.log(`Customer '${demoCustomerName}' already exists.`);
        }

        console.log('Seeding completed successfully.');

    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        // adapter.dispose() is handled internally or process exit
    }
}

main();
