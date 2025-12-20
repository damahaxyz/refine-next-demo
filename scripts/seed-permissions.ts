
import dotenv from "dotenv";

//先加载evn，再动态import 才能找到env的变量
dotenv.config({ path: ".env.local" });

const seedPermissions = async () => {
    console.log("Seeding permissions...");

    // Dynamic import to ensure env is loaded first
    const { default: dbConnect } = await import("../src/lib/db");
    const { default: Role } = await import("../src/models/role");
    const { PERMISSIONS } = await import("../src/config/permissions");

    await dbConnect();

    // 1. Collect all permissions from config
    const allPermissions: string[] = [];
    Object.values(PERMISSIONS).forEach((module: any) => {
        if (module.ACTIONS) {
            Object.values(module.ACTIONS).forEach((action: any) => {
                allPermissions.push(action);
            });
        }
    });

    console.log(`Found ${allPermissions.length} permissions defined in config.`);

    // 2. Find or Create 'admin' and 'user' roles
    // We want to ensure 'admin' has ALL permissions.
    // 'user' might have a subset.

    const adminRole = await Role.findOne({ name: "admin" });

    if (adminRole) {
        console.log("Updating admin role permissions...");
        // Update admin to have all permissions
        adminRole.permissions = allPermissions;
        await adminRole.save();
        console.log("Admin role updated.");
    } else {
        console.log("Creating admin role...");
        await Role.create({
            name: "admin",
            permissions: allPermissions
        });
        console.log("Admin role created.");
    }

    // Optional: Update 'user' role with read-only permissions?
    // For now, let's just make sure admin is sync'd.

    console.log("Permissions seeded successfully.");
    process.exit(0);
};

seedPermissions().catch(err => {
    console.error("Error seeding permissions:", err);
    process.exit(1);
});
