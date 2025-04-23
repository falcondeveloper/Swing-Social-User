/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */
// Next Imports
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

const SALT_SIZE = 16; // Equivalent to `PasswordHasher.SaltSize` in C#
const HASH_ALGORITHM_NAME = "sha256"; // Equivalent to `PasswordHasher.HashAlgorithmName.Name`
const VERSION = 1; // Example version, same as `PasswordHasher.GetVersion

export const dynamic = 'force-dynamic';

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

function formatDateToMMDDYYYY(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so add 1
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${month}/${day}/${year}`;
}

function extractName(userName: string): { first_name: string; last_name: string } {
  const nameParts = userName.split(' '); // Split on space
  if (nameParts.length === 2) {
    // If there are exactly two parts
    return {
      first_name: nameParts[0],
      last_name: nameParts[1],
    };
  } else {
    // If there is no space or other unexpected formats
    return {
      first_name: userName,
      last_name: '',
    };
  }
}

export async function POST(req: any) {
  // Parse the incoming request body
  console.log(req)
  const { email, age, city, password, phone, userName, affiliate, hitid } = await req.json();
  try {

    const currentDate = new Date();
    const ageInt = parseInt(age, 10);
    const birthYear = currentDate.getFullYear() - ageInt;

    const birthDate = new Date(currentDate);
    birthDate.setFullYear(birthYear);

    const birthDateStr = formatDateToMMDDYYYY(birthDate);

    const { first_name, last_name } = extractName(userName);

    const hashedPassword = hashPassword(password);

    console.log(first_name, last_name, email, age, city, hashedPassword, phone, userName, birthDateStr)
    const result = await pool.query(
      'SELECT * FROM public.web_insert_profilepage1($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [email, first_name, last_name, hashedPassword, phone, birthDateStr, city, affiliate, hitid]
    );

    // Assuming the result contains the "ProfileId" field in the first row
    const profileId = result.rows[0]?.ProfileId;
    console.log(profileId)

    if (profileId) {
      return NextResponse.json({
        message: 'Profile created successfully',
        profileId: profileId,
      });
    } else {
      return NextResponse.json({
        message: 'Profile creation failed',
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error inserting profile:', error);
    return NextResponse.json(
      {
        message: 'Error inserting profile',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
