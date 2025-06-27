import mysql from "mysql2";
import { NextResponse } from "next/server";

const pool = mysql.createPool({
  user: "swing_social_admin",
  host: "localhost",
  database: "swing_social_admin",
  password: "B73I1RIAYOFJMDY6",
});

function query(sql: string, values: any[] = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { affiliate, referral, OS, page, url, userid } = body;

    const queryString = `
      INSERT INTO wp_user_tracking (affiliate, referral, OS, page, url, userid)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [affiliate, referral, OS, page, url, userid];

    await query(queryString, values);

    return NextResponse.json({ success: true, message: "Tracking data saved" });
  } catch (error) {
    console.error("MySQL Error:", error);
    return NextResponse.json(
      { error: "Database insert failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Use POST method for tracking data" },
    { status: 405 }
  );
}
