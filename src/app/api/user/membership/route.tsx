import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";
import jwt from "jsonwebtoken";

const JWT_SECRET = "SwingSocialLesile";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    let query = `SELECT * FROM admin_upgrade_to_paid($1)`;
    const values = [userId];

    const membershipStatus = await pool.query(query, values);

    return NextResponse.json({
      membership: membershipStatus.rows,
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { profileId, price, username, avatar } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required to upgrade the user." },
        { status: 400 }
      );
    }

    const upgradeQuery = `SELECT * FROM admin_upgrade_to_paid2($1, $2)`;
    const result = await pool.query(upgradeQuery, [profileId, price]);

    if (result?.rowCount === 0) {
      return NextResponse.json(
        { error: `No user found with Profile ID ${profileId}` },
        { status: 404 }
      );
    }

    const updatedToken = jwt.sign(
      {
        profileId: profileId,
        profileName: username,
        avatar: avatar,
        membership: 1,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json(
      {
        success: true,
        message: `User with Profile ID ${profileId} upgraded successfully.`,
        updatedToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to upgrade user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
