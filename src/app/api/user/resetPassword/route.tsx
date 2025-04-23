import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SALT_SIZE = 16; // Equivalent to `PasswordHasher.SaltSize` in C#
const HASH_ALGORITHM_NAME = "sha256"; // Equivalent to `PasswordHasher.HashAlgorithmName.Name`
const VERSION = 1; // Example version, same as `PasswordHasher.GetVersion

export const dynamic = 'force-dynamic';

const JWT_SECRET = "SwingSocialLesile";

// PostgreSQL pool connection setup
const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

const hashPasswordWithSalt = (password: string, salt: Buffer): Buffer => {
    const hash = crypto.createHash(HASH_ALGORITHM_NAME); // Create a hash instance
    hash.update(salt); // Add the salt to the hash
    hash.update(Buffer.from(password, "utf8")); // Add the password to the hash
    return hash.digest(); // Finalize and return the hash
};

const generateSalt = (byteLength: number): Buffer => {
    return crypto.randomBytes(byteLength); // Generate random bytes
};

const hashPassword = (password: string): string => {
    if (!password) {
        throw new Error("Password cannot be null or undefined.");
    }

    const salt = generateSalt(SALT_SIZE); // Generate a random salt
    const hash = hashPasswordWithSalt(password, salt); // Hash the password with the salt

    // Combine version, salt, and hash into a single buffer
    const combined = Buffer.concat([
        Buffer.from([VERSION]), // Version as the first byte
        salt, // Salt
        hash, // Hash
    ]);

    // Convert the combined result to a Base64 string
    return combined.toString("base64");
};

export async function POST(req: any) {
    const { userName, pwd } = await req.json();

    console.log(userName);
    console.log(pwd);

    const hashedPasswrod = hashPassword(pwd);
    console.log(hashedPasswrod);

    try {
        const queryByEmail = `SELECT * FROM web_one_profile_email($1)`;

        const result = await pool.query(queryByEmail, [userName]);

        if (result.rows.length !== 0) {

            const query = `SELECT * FROM admin_update_password_by_email($1, $2)`;
            const result = await pool.query(query, [userName, hashedPasswrod]);

            if (result.rows.length != 0) {

                return NextResponse.json({
                    message: 'Your password is updated successfully!',
                    status: 200,
                });

            } else {
                throw new Error('Sorry, we can not process your request');
            }
        }
        else {
            return NextResponse.json({
                message: 'We can not find the username. Please register to the website',
                status: 404,
            });
        }
    }

    catch (error: any) {
        return NextResponse.json({
            message: 'Failure',
        }, { status: 400 });
    }
}