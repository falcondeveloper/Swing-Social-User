import { NextRequest, NextResponse } from "next/server";
import { messaging } from "@/lib/firebase/admin";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

type NotificationType =
  | "new_match"
  | "message"
  | "like"
  | "request"
  | "friend_request";

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, type, data } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const preferencesResult = await pool.query(
      `SELECT preferences 
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    if (preferencesResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preferences = preferencesResult.rows[0].preferences || {};

    const notificationEnabled = {
      new_match: preferences.newMatches !== false,
      message: preferences.messages !== false,
      like: preferences.likes !== false,
      request: preferences.requests !== false,
      friend_request: preferences.friendRequests !== false,
    };

    if (preferences.pushNotifications === false) {
      return NextResponse.json({
        success: true,
        message: "Notification skipped - user disabled push notifications",
      });
    }

    if (type && !notificationEnabled[type as NotificationType]) {
      return NextResponse.json({
        success: true,
        message: "Notification skipped - user disabled this type",
        type,
      });
    }

    const result = await pool.query(
      "SELECT deviceToken FROM public.web_get_devicetoken($1)",
      [userId]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { message: "No device tokens found." },
        { status: 404 }
      );
    }

    const responses = [];
    const targetUrl = data?.url || "/";

    for (const row of result.rows) {
      const deviceToken = row.devicetoken;

      const message = {
        token: deviceToken,
        notification: {
          title: title || "SwingSocial",
          body: body || "You have a new notification",
        },
        webpush: {
          fcmOptions: {
            link: targetUrl,
          },
          notification: {
            icon: "/logo.png",
          },
        },
        data: {
          url: targetUrl,
          timestamp: Date.now().toString(),
          title: title || "SwingSocial",
          body: body || "You have a new notification",
          type: type || "general",
          ...data,
        },
        android: {
          notification: {
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
      };

      try {
        const response = await messaging.send(message);
        responses.push({
          token: deviceToken,
          status: "success",
          response,
          type,
        });
      } catch (err: any) {
        responses.push({
          token: deviceToken,
          status: "error",
          error: err.message,
          type,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: responses,
      preferences,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
