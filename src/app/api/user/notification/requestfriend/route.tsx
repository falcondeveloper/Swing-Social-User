import { messaging } from "@/lib/firebase/admin";
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
    const { id, title, body, url } = await req.json();

    const result = await pool.query(
      "SELECT deviceToken FROM public.web_get_devicetoken($1)",
      [id]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { message: "No device tokens found." },
        { status: 404 }
      );
    }

    const responses = [];
    for (const row of result.rows) {
      const deviceToken = row.devicetoken;

      console.log("row", row);

      const message = {
        token: deviceToken,
        notification: {
          title: title || "SwingSocial",
          body: body || "You have a new notification",
        },
        webpush: {
          notification: {
            icon: "/logo.png",
          },
        },
        data: {
          url: url || "/",
        },
      };

      try {
        const response = await messaging.send(message);
        responses.push({ token: deviceToken, status: "success", response });
      } catch (err: any) {
        responses.push({
          token: deviceToken,
          status: "error",
          error: err.message,
        });
      }
    }

    return NextResponse.json({ results: responses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
