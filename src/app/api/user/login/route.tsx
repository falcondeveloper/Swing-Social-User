import { NextResponse } from "next/server";
import { Pool } from "pg";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const SALT_SIZE = 16; // Equivalent to `PasswordHasher.SaltSize` in C#
const HASH_ALGORITHM_NAME = "sha256"; // Equivalent to `PasswordHasher.HashAlgorithmName.Name`
const VERSION = 1; // Example version, same as `PasswordHasher.GetVersion

export const dynamic = "force-dynamic";

const JWT_SECRET = "SwingSocialLesile";

// PostgreSQL pool connection setup
const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
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

const verifyPassword = (
  providedPassword: string,
  storedHash: string
): boolean => {
  try {
    // Decode the stored hash from base64
    const combined = Buffer.from(storedHash, "base64");

    // Extract components
    const version = combined[0];
    const salt = combined.slice(1, SALT_SIZE + 1);
    const hash = combined.slice(SALT_SIZE + 1);

    // Verify version
    if (version !== VERSION) {
      return false;
    }

    // Hash the provided password with the extracted salt
    const computedHash = hashPasswordWithSalt(providedPassword, salt);

    // Compare the computed hash with the stored hash
    return crypto.timingSafeEqual(computedHash, hash);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

export async function POST(req: any) {
  const { email, pwd } = await req.json();

  console.log("email", email);
  console.log("password", pwd);

  const query = `SELECT * FROM web_one_profile_email($1)`;
  const querybyUserName = `SELECT * FROM public.admin_getoneprofile_by_user($1)`;
  const lastOnline = `SELECT * From public.edit_profile_lastonline($1)`;
  try {
    const result = await pool.query(query, [email]);

    console.log(result.rows.length);

    if (result.rows.length == 0) {
      const searchByUser = await pool.query(querybyUserName, [email]);

      console.log(searchByUser.rows[0]);

      console.log(searchByUser?.rows[0]);

      if (searchByUser.rows.length == 0) {
        return NextResponse.json({
          message: "No registered users found. Please sign up on the homepage.",
          status: 404,
          profileId: null,
        });
      } else {
        const profileId = searchByUser?.rows[0].Id;
        const avatar = searchByUser?.rows[0].Avatar;
        const userName = searchByUser?.rows[0].Username;
        const membership =
          searchByUser?.rows[0].Title !== "Free Member" ? 1 : 0;
        const memberalarm = searchByUser?.rows[0].SwipeHelp;
        console.log("membershipe", membership);
        const token = jwt.sign(
          {
            profileId: profileId,
            profileName: userName,
            avatar: avatar,
            membership: membership,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        const isValid = verifyPassword(pwd, searchByUser.rows[0].Password);

        if (isValid == true) {
          await pool.query(lastOnline, [profileId]);
          return NextResponse.json({
            message: "Login successfully!",
            status: 200,
            jwtToken: token,
            currentAvatar: avatar,
            currentProfileId: profileId,
            currentuserName: userName,
            memberAlarm: memberalarm,
            memberShip: membership,
          });
        } else {
          return NextResponse.json({
            message: "The password you entered is incorrect.",
            status: 500,
            currentAvatar: null,
            currentProfileId: null,
            currentuserName: null,
          });
        }
      }
    } else {
      const profileId = result?.rows[0].Id;
      const avatar = result?.rows[0].Avatar;
      const userName = result?.rows[0].Username;
      const memberalarm = result?.rows[0].SwipeHelp;
      const membership = result?.rows[0].Title !== "Free Member" ? 1 : 0;

      const token = jwt.sign(
        {
          profileId: profileId,
          profileName: userName,
          avatar: avatar,
          membership: membership,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const isValid = verifyPassword(pwd, result.rows[0].Password);

      console.log(isValid);

      if (isValid == true) {
        await pool.query(lastOnline, [profileId]);
        return NextResponse.json({
          message: "Logged in successfully!",
          status: 200,
          jwtToken: token,
          currentAvatar: avatar,
          currentProfileId: profileId,
          currentuserName: userName,
          memberAlarm: memberalarm,
          memberShip: membership,
        });
      } else {
        return NextResponse.json({
          message: "Your password is incorrect",
          status: 500,
          currentAvatar: null,
          currentProfileId: null,
          currentuserName: null,
        });
      }
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Failure",
      },
      { status: 400 }
    );
  }
}
