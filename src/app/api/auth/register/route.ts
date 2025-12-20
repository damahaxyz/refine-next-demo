import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Account from "@/models/account";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json({
                code: 1,
                message: "Username, email and password are required",
            });
        }

        const existingAccount = await Account.findOne({ $or: [{ username }, { email }] });
        if (existingAccount) {
            return NextResponse.json({
                code: 1,
                message: "Username or email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAccount = await Account.create({
            username,
            // email is not in the schema shown earlier (Step 1367), but let's check if I should add it or if the schema was truncated. 
            // The schema in Step 1367 showed: username, password, name, avatar, roleIds, extraPermissions. 
            // It did NOT show email.
            // However, usually Account has email. I should check if I need to update Schema or if I should just ignore email for now.
            // The user wants "check account password", and registration usually implies email.
            // Let's re-read the schema file content from Step 1367 carefully.
            // Schema: username, password, name, avatar, roleIds, extraPermissions.
            // MISSING: email.
            // I should probably add email to the Account schema first, or map email to name? No, name is display name.
            // I will add email to the Account schema as well.
            email, // Added email based on the instruction's code edit
            password: hashedPassword,
            name: username, // Default name to username
            roles: ["user"], // Default role
        });

        return NextResponse.json({
            code: 0,
            message: "Registration successful",
            data: {
                username: newAccount.username,
                id: newAccount._id
            }
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({
            code: 1,
            message: error.message || "Registration failed",
        });
    }
}
