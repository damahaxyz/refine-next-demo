
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load env vars
// Note: In a real app we might need 'dotenv' package, assuming .env.local exists
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define MONGODB_URI in .env.local");
    process.exit(1);
}

const accountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    roleIds: [String],
    extraPermissions: [String],
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now }
});

const Account = mongoose.models.Account || mongoose.model('Account', accountSchema);

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        const username = "root";
        const password = "root123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const exists = await Account.findOne({ username });
        if (exists) {
            console.log(`User '${username}' already exists. Updating password...`);
            exists.password = hashedPassword;
            exists.name = "Root Administrator";
            // Make sure root has ALL permissions or a specific SuperAdmin role concept
            // For now, we leave permissions as is or clear them
            await exists.save();
            console.log("Root user updated.");
        } else {
            console.log(`Creating user '${username}'...`);
            await Account.create({
                username,
                password: hashedPassword,
                name: "Root Administrator",
                roleIds: [],
                extraPermissions: ["*"], // Convention for superadmin? Or just give explicit permissions later
            });
            console.log("Root user created.");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
