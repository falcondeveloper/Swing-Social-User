import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Missing email in request body." },
        { status: 400 }
      );
    }

    const query = `SELECT * FROM check_membership_by_email($1)`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No profile found for this email.",
        status: 404,
      });
    }

    const user = result.rows[0];

    const membershipTitle = user.Title || "Free Member";
    const membershipStatus =
      membershipTitle !== "Free Member" ? "Active" : "Free";

    return NextResponse.json({
      success: true,
      message: "Membership found successfully.",
      email: user.Email,
      username: user.Username,
      profileId: user.Id,
      avatar: user.Avatar,
      title: membershipTitle,
      price: user.Price,
      membershipStatus,
      subscription: user.Subscription,
    });
  } catch (error: any) {
    console.error("Error checking membership:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
