import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: any) {
  const {
    fromId,
    toId,
    htmlBody,
    subject,
    image1,
    image2,
    image3,
    image4,
    image5,
  } = await req.json();

  try {
    const chatResult = await pool.query(
      "SELECT * FROM public.insert_mailmessage_push($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [fromId, toId, subject, htmlBody, image1, image2, image3, image4, image5]
    );

    return NextResponse.json({
      message: "Chat conversation inserted successfully",
      data: chatResult.rows,
    });
  } catch (error: any) {
    console.error("Error:", error);

    return NextResponse.json(
      {
        message: "Chat conversation insertion failed",
        error: error.message,
      },
      { status: 400 }
    );
  }
}

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const profileid = searchParams.get("profileid");
  const type = searchParams.get("type");

  if (!profileid) {
    return NextResponse.json(
      {
        message: "Profile ID is required",
      },
      { status: 400 }
    );
  }

  try {
    if (type == "received") {
      const result = await pool.query(
        "SELECT * FROM public.get_mailinbox($1)",
        [profileid]
      );

      return NextResponse.json({
        message: "Chats fetched successfully",
        data: result.rows,
      });
    } else if (type == "sent") {
      const result = await pool.query(
        "SELECT * FROM public.get_mailsentbox($1)",
        [profileid]
      );

      return NextResponse.json({
        message: "Chats fetched successfully",
        data: result.rows,
      });
    }
  } catch (error: any) {
    console.error("Error fetching chats:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch chats",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
