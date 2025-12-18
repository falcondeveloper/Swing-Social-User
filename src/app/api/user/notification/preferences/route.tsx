import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

const DEFAULT_PREFERENCES = {
  pushNotifications: true,
  newMatches: true,
  messages: true,
  likes: true,
  requests: false,
  friendRequests: true,
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID (UUID) is required" },
        { status: 400 }
      );
    }

    const userExists = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM "UserProfiles" WHERE "Id" = $1)`,
      [userId]
    );

    if (!userExists.rows[0].exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await pool.query(
      `SELECT preferences 
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    let preferences = DEFAULT_PREFERENCES;

    if (result.rows.length > 0 && result.rows[0].preferences) {
      preferences = { ...DEFAULT_PREFERENCES, ...result.rows[0].preferences };
    } else {
      await pool.query(
        `INSERT INTO notification_preferences (user_id, preferences)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, JSON.stringify(DEFAULT_PREFERENCES)]
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("GET preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID (UUID) is required", success: false },
        { status: 400 }
      );
    }

    const userExists = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM "UserProfiles" WHERE "Id" = $1)`,
      [userId]
    );

    console.log("userExists", userExists);

    if (!userExists.rows[0].exists) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    const updateResult = await pool.query(
      `INSERT INTO notification_preferences (user_id, preferences)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         preferences = EXCLUDED.preferences,
         updated_at = CURRENT_TIMESTAMP
       RETURNING user_id`,
      [userId, JSON.stringify(preferences)]
    );

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
      userId,
    });
  } catch (error) {
    console.error("POST preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences", success: false },
      { status: 500 }
    );
  }
}
