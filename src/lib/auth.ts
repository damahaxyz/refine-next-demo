
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as any; // Should contain userId, permissions, etc.
    } catch (err) {
        throw new Error("Invalid Token");
    }
}
