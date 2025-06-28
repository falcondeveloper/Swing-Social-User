import mysql from "mysql2";
import { NextResponse } from "next/server";

let pool: any;

if (!pool) {
  pool = mysql.createPool({
    user: "swing_social_admin",
    host: "localhost",
    database: "swing_social_admin",
    password: "B73I1RIAYOFJMDY6",
  });

  // Test MySQL connection
  pool.getConnection((err: any, connection: any) => {
    if (err) {
      console.error("MySQL Connection Failed:", err.message, err);
    } else {
      console.log("✅ MySQL Connection Successful");
      connection.release();
    }
  });
}

function query(sql: string, values: any[] = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error: any, results: unknown) => {
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
      INSERT INTO wpgt_user_tracking (affiliate, referral, OS, page, url, userid)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [affiliate, referral, OS, page, url, userid];

    await query(queryString, values);

    return NextResponse.json({ success: true, message: "Tracking data saved" });
  } catch (error: any) {
    console.error("MySQL Error:", error.message, error);
    return NextResponse.json(
      { error: "Database insert failed", details: error.message },
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
