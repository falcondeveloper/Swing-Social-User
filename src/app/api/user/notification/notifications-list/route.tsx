import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

// GET - Fetch notifications for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const notificationsResult = await pool.query(
      `SELECT 
        id,
        user_id,
        sender_id,
        type,
        title,
        body,
        url,
        is_read,
        created_at,
        metadata
      FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [profileId, limit, offset]
    );

    const unreadResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [profileId]
    );

    return NextResponse.json({
      success: true,
      notifications: notificationsResult.rows,
      unreadCount: parseInt(unreadResult.rows[0].count),
      total: notificationsResult.rowCount,
    });
  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Create a new notification
export async function POST(req: NextRequest) {
  try {
    const { userId, senderId, title, body, type, url, metadata } =
      await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Insert notification into database
    const result = await pool.query(
      `INSERT INTO notifications 
        (user_id, sender_id, type, title, body, url, metadata, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
       RETURNING *`,
      [
        userId,
        senderId || null,
        type || "general",
        title,
        body,
        url || "/",
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      notification: result.rows[0],
    });
  } catch (err: any) {
    console.error("Error creating notification:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(req: NextRequest) {
  try {
    const { notificationIds, profileId, markAllAsRead } = await req.json();

    if (markAllAsRead && profileId) {
      // Mark all notifications as read for user
      await pool.query(
        `UPDATE notifications 
         SET is_read = true 
         WHERE user_id = $1 AND is_read = false`,
        [profileId]
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Notification IDs array is required" },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = ANY($1::int[])`,
      [notificationIds]
    );

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (err: any) {
    console.error("Error updating notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Delete notification(s)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const profileId = searchParams.get("profileId");

    if (notificationId) {
      // Delete specific notification
      await pool.query(
        `DELETE FROM notifications 
         WHERE id = $1`,
        [notificationId]
      );

      return NextResponse.json({
        success: true,
        message: "Notification deleted",
      });
    }

    if (profileId) {
      // Delete all notifications for user
      await pool.query(
        `DELETE FROM notifications 
         WHERE user_id = $1`,
        [profileId]
      );

      return NextResponse.json({
        success: true,
        message: "All notifications deleted",
      });
    }

    return NextResponse.json(
      { error: "Notification ID or Profile ID is required" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error deleting notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
