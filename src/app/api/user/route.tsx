import { NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";

const SALT_SIZE = 16;
const HASH_ALGORITHM_NAME = "sha256";
const VERSION = 1;

export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

const hashPasswordWithSalt = (password: string, salt: Buffer): Buffer => {
  const hash = crypto.createHash(HASH_ALGORITHM_NAME);
  hash.update(salt);
  hash.update(Buffer.from(password, "utf8"));
  return hash.digest();
};

const generateSalt = (byteLength: number): Buffer => {
  return crypto.randomBytes(byteLength);
};

const hashPassword = (password: string): string => {
  if (!password) {
    throw new Error("Password cannot be null or undefined.");
  }

  const salt = generateSalt(SALT_SIZE);
  const hash = hashPasswordWithSalt(password, salt);

  const combined = Buffer.concat([Buffer.from([VERSION]), salt, hash]);
  return combined.toString("base64");
};

function formatDateToMMDDYYYY(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${month}/${day}/${year}`;
}

function extractName(userName: string): {
  first_name: string;
  last_name: string;
} {
  const nameParts = userName.split(" ");
  if (nameParts.length === 2) {
    return {
      first_name: nameParts[0],
      last_name: nameParts[1],
    };
  } else {
    return {
      first_name: userName,
      last_name: "",
    };
  }
}

export async function POST(req: any) {
  const { email, age, city, password, phone, userName, affiliate, hitid } =
    await req.json();
  try {
    const currentDate = new Date();
    const ageInt = parseInt(age, 10);
    const birthYear = currentDate.getFullYear() - ageInt;

    const birthDate = new Date(currentDate);
    birthDate.setFullYear(birthYear);

    const birthDateStr = formatDateToMMDDYYYY(birthDate);

    const { first_name, last_name } = extractName(userName);

    const hashedPassword = hashPassword(password);

    const result = await pool.query(
      "SELECT * FROM public.web_insert_profilepage1($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        email,
        first_name,
        last_name,
        hashedPassword,
        phone,
        birthDateStr,
        city,
        affiliate,
        hitid,
      ]
    );
    const profileId = result.rows[0]?.ProfileId;

    if (profileId) {
      return NextResponse.json({
        message: "Profile created successfully",
        profileId: profileId,
      });
    } else {
      return NextResponse.json(
        {
          message: "Profile creation failed",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error inserting profile:", error);
    return NextResponse.json(
      {
        message: "Error inserting profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
