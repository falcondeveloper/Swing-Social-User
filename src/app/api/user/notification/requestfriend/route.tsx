import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import admin from "firebase-admin";
import FormData from "form-data";
import Mailgun from "mailgun.js";

if (!admin.apps.length) {
  const projectId = "swing-social-website-37364";
  const privateKey =
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtm3iIU1qbsPXU\nbWNj24YbrhrozG / 1flOhprTE4C1zniBpVcFcRmvmsXK / pzqsGmWefHtqvfGcHoPy\nnV5ecp8 + ByAssFveOIKppd3Bt4yPkoo87f2Gd04 / SB0nEkqV9EPiHRsOA4sxTKg4\n6odvLKv + W + oE3r8RDtcQQGW / 4e5KK7TWCcYBzzHL5mBDapXolAXi4segic6PEYqj\n6Yz0pERM4w7MpDDxD32reaUF9IBbEJZH8aIobd9QAo5n / 9ROILRU + rXzaGhiBi5k\nzWTsU + 27of / 7JZ1yOCrN0H5ol8a6hD4C2LzuBus + GSfbE + u9Xx7AgxlorgHv1X9x\nrrCvLNwFAgMBAAECggEAI + 9aADHsv + xdvjZUS9 + tPz6HIGfsxs56xiupIFVc4yE4\niUUwbIbBH / PcEjKt0OD35tnSfBJMGCoy2r3bQkaMkrzL2qQ4p + NfnHkSUV5KcI9 /\nIMSMZVB9uFiXfDZrjOWORZgLuRdfsPkymvFkzkzbXx + sbYyj1QaS2rDRvumntt9E\nrTrPFsmQ6zwLehPZTm3AGUMbM1aMgWD3kD0iUaLsqpwzVbsCS4n0tsiAVTtA + yuC\n7o4YD8s5eo / 6xO + /weghDIhP0liLXs0iUZz8++SLP2hhAq/AcmYAW9FLeis2u4fI\nky + q6jFFoZO7LguqEV + Jczouxx1pCjLVbrQLAndjMQKBgQDhHkmOF4cUQq0u8pDa\nZ2Ir9AmRnlWYxRqrWa8q7PiYY7 + MgFbp46qooKDx2oNzvVUELe8Fzj55mrdtdK0A\njm6EBULDM9uZt / SgI2NqdDsQvXYB9OMp3tjtk0mUdB01KTn3uG8HHPLQaba9MT7h\nz7Gpe + NBL5rLi8FHrMqPWMuSmQKBgQDFbDflE8u9UIP53CJaDpQFEqJcqIW3 + YLo\nlvSYa / LZRuKJKLtyxFtYNBrQSxZZbJd6K + GEfdPsJu2r2HgdBgXAit + jNjTcyuBd\nd + Fne2Yq1DClR8uFeOy7amkI7t7QvCWTv7jwnPsCWMnuThnq0XZ9MGazsRWMsn32\nFiR1dN5kTQKBgQCxs6vSe2YIqz10Aswva06GbaQkC71705Ni0W / Bzb / K42pwKVry\nU + ICLJH / eEMt2LXEj9HPXmfYrDXBNEngV46Lrm9uEYB2zkxPIMA4Zzm81CHUF5A +\nHAhXOV3qzuHDdiCpGDCkh8hwlhJHNBl0PPP8WqwgZ8ikhlRzFMXs8 + X2eQKBgE9U\nAsm7wJxbpAxcVjlVrkiziiYtWT3ptp57OeGdTsHb598xTND68bFpjnSwF1Tre5qN\n01qHrQYxRkNNAka3SsxpgR92ApvNsYYdS6dnQFBpXvqq9K63Pni4c2gxg7rgP0E1\nQrz8dygkQU / Odj + S10fKkRoXSA93EYI2t4Oy6EHpAoGBAI9vgdo0zDBoJqF5nV44\nLDC0qgOiLC77e7V2pcmPZaOggWKxvxKXvkTpsdVoj0OK1nPq2i7ZduiSqdHG9lUi\nCRbqbZs4rBhREHqxXLIaNc + R + xgQ7AbU / qJVKczapl9T9ZoYJgWpqHd58jUvQwF4\nqdS8RksHXTwA97KeJ04hRaAv\n-----END PRIVATE KEY-----\n";
  const clientEmail =
    "firebase-adminsdk-fbsvc@swing-social-website-37364.iam.gserviceaccount.com";

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error("Missing Firebase Admin credentials");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      clientEmail,
    }),
  });
}

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

interface TokenResult {
  token: string;
  tokenPreview: string;
  isValid: boolean;
  sent: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

interface NotificationLog {
  userId: string;
  title: string;
  body: string;
  type: string;
  url: string;
  timestamp: string;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  invalidTokenCount: number;
  tokenResults: TokenResult[];
}

// Helper function to mask token for privacy
function maskToken(token: string): string {
  if (!token || token.length < 20) return "INVALID_TOKEN_FORMAT";
  return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
}

// Helper function to check if error indicates invalid token
function isInvalidTokenError(error: any): boolean {
  const invalidTokenCodes = [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument",
  ];
  return invalidTokenCodes.includes(error?.code);
}

// Send email log report
async function sendNotificationLogEmail(log: NotificationLog): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = result.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      console.error("MAILGUN_KEY not found in configuration");
      return;
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    // Build HTML email content
    const statusColor = log.failureCount > 0 ? "#e74c3c" : "#27ae60";
    const statusText = log.failureCount > 0 ? "⚠️ Some Failed" : "✅ All Sent";

    const tokenResultsHtml = log.tokenResults
      .map(
        (result) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; font-family: monospace; font-size: 12px;">${
            result.tokenPreview
          }</td>
          <td style="padding: 10px; text-align: center;">
            <span style="padding: 4px 8px; border-radius: 4px; background: ${
              result.isValid ? "#27ae60" : "#e74c3c"
            }; color: white; font-size: 12px;">
              ${result.isValid ? "Valid" : "Invalid"}
            </span>
          </td>
          <td style="padding: 10px; text-align: center;">
            <span style="padding: 4px 8px; border-radius: 4px; background: ${
              result.sent ? "#27ae60" : "#e74c3c"
            }; color: white; font-size: 12px;">
              ${result.sent ? "Sent" : "Failed"}
            </span>
          </td>
          <td style="padding: 10px; font-size: 12px; color: ${
            result.error ? "#e74c3c" : "#27ae60"
          };">
            ${result.error || result.messageId || "-"}
          </td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Push Notification Log</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 10px;">🔔 Push Notification Log</h1>
          <p style="color: #666; margin-bottom: 30px;">Timestamp: ${log.timestamp}</p>
          
          <div style="background: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 15px; margin-bottom: 30px;">
            <h2 style="color: ${statusColor}; margin: 0;">${statusText}</h2>
            <p style="margin: 10px 0 0 0; color: #666;">
              ${log.successCount} of ${log.totalTokens} notifications sent successfully
            </p>
          </div>
          
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Notification Details</h3>
          <table style="width: 100%; margin-bottom: 30px;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;"><strong>User ID:</strong></td><td>${log.userId}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Type:</strong></td><td>${log.type}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Title:</strong></td><td>${log.title}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Body:</strong></td><td>${log.body}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>URL:</strong></td><td>${log.url}</td></tr>
          </table>
          
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Summary</h3>
          <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
            <div style="background: #f8f9fa; padding: 15px 25px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #333;">${log.totalTokens}</div>
              <div style="color: #666; font-size: 12px;">Total Tokens</div>
            </div>
            <div style="background: #d4edda; padding: 15px 25px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${log.successCount}</div>
              <div style="color: #666; font-size: 12px;">Successful</div>
            </div>
            <div style="background: #f8d7da; padding: 15px 25px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${log.failureCount}</div>
              <div style="color: #666; font-size: 12px;">Failed</div>
            </div>
            <div style="background: #fff3cd; padding: 15px 25px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #856404;">${log.invalidTokenCount}</div>
              <div style="color: #666; font-size: 12px;">Invalid Tokens</div>
            </div>
          </div>
          
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Token Results</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #666;">Token</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; color: #666;">Valid</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; color: #666;">Sent</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #666;">Details</th>
              </tr>
            </thead>
            <tbody>
              ${tokenResultsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>This is an automated notification log from SwingSocial.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mg.messages.create("swingsocial.co", {
      from: "SwingSocial Notifications <notifications@swingsocial.co>",
      to: "baldhavansh2505@gmail.com", // Replace with your email
      subject: `[${
        log.failureCount > 0 ? "⚠️ ALERT" : "✅ OK"
      }] Push Notification Log - ${log.type} - ${log.successCount}/${
        log.totalTokens
      } sent`,
      html: htmlContent,
    });

    console.log("[EMAIL] Notification log email sent successfully");
  } catch (error) {
    console.error("[EMAIL] Failed to send notification log email:", error);
  }
}

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[${timestamp}] 🔔 PUSH NOTIFICATION REQUEST STARTED`);
  console.log(`${"=".repeat(60)}`);

  try {
    const { userId, title, body, type, url } = await req.json();

    console.log(`[INFO] Request payload:`, {
      userId,
      title,
      body,
      type,
      url,
    });

    if (!userId) {
      console.log(`[ERROR] ❌ User ID is missing`);
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check user preferences
    const preferencesResult = await pool.query(
      `SELECT preferences 
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    if (preferencesResult.rows.length === 0) {
      console.log(`[ERROR] ❌ User not found: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preferences = preferencesResult.rows[0].preferences || {};
    console.log(`[INFO] User preferences:`, preferences);

    const notificationEnabled = {
      new_match: preferences.newMatches !== false,
      message: preferences.messages !== false,
      like: preferences.likes !== false,
      request: preferences.requests !== false,
      friend_request: preferences.friendRequests !== false,
    };

    if (preferences.pushNotifications === false) {
      console.log(`[SKIP] ⏭️ Push notifications disabled for user`);
      return NextResponse.json({
        success: true,
        message: "Notification skipped - push disabled",
      });
    }

    if (!type || !notificationEnabled[type as NotificationType]) {
      console.log(`[SKIP] ⏭️ Notification type "${type}" is disabled`);
      return NextResponse.json({
        success: true,
        message: "Notification skipped - type disabled",
        type,
      });
    }

    // Get device tokens
    const tokenRes = await pool.query(
      "SELECT deviceToken FROM public.web_get_devicetoken($1)",
      [userId]
    );

    if (!tokenRes.rows.length) {
      console.log(`[ERROR] ❌ No device tokens found for user: ${userId}`);
      return NextResponse.json(
        { message: "No device tokens found" },
        { status: 404 }
      );
    }

    console.log(`[INFO] Found ${tokenRes.rows.length} device token(s)`);

    const targetUrl = url || "/";
    const notificationTitle = title || "SwingSocial";
    const notificationBody = body || "You have a new notification";

    const tokenResults: TokenResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    let invalidTokenCount = 0;

    // Process each token
    for (let i = 0; i < tokenRes.rows.length; i++) {
      const row = tokenRes.rows[i];
      const firebaseToken = row.devicetoken;
      const tokenPreview = maskToken(firebaseToken);

      console.log(
        `\n[TOKEN ${i + 1}/${tokenRes.rows.length}] Processing: ${tokenPreview}`
      );

      // Basic token validation
      if (
        !firebaseToken ||
        typeof firebaseToken !== "string" ||
        firebaseToken.length < 100
      ) {
        console.log(`[TOKEN ${i + 1}] ❌ Invalid token format`);
        tokenResults.push({
          token: firebaseToken,
          tokenPreview,
          isValid: false,
          sent: false,
          error: "Invalid token format",
          errorCode: "INVALID_FORMAT",
        });
        failureCount++;
        invalidTokenCount++;
        continue;
      }

      const payload = {
        data: {
          title: notificationTitle,
          body: notificationBody,
          url: targetUrl,
        },
        token: firebaseToken,
      };

      try {
        const messageId = await admin.messaging().send(payload);
        console.log(
          `[TOKEN ${i + 1}] ✅ Sent successfully! Message ID: ${messageId}`
        );

        tokenResults.push({
          token: firebaseToken,
          tokenPreview,
          isValid: true,
          sent: true,
          messageId,
        });
        successCount++;
      } catch (error: any) {
        const isInvalid = isInvalidTokenError(error);
        console.log(`[TOKEN ${i + 1}] ❌ Failed to send`);
        console.log(`[TOKEN ${i + 1}] Error code: ${error.code}`);
        console.log(`[TOKEN ${i + 1}] Error message: ${error.message}`);

        if (isInvalid) {
          console.log(
            `[TOKEN ${
              i + 1
            }] ⚠️ Token is INVALID/EXPIRED - should be removed from database`
          );
          invalidTokenCount++;

          // Optionally: Delete invalid token from database
          // await pool.query("DELETE FROM device_tokens WHERE token = $1", [firebaseToken]);
        }

        tokenResults.push({
          token: firebaseToken,
          tokenPreview,
          isValid: !isInvalid,
          sent: false,
          error: error.message,
          errorCode: error.code,
        });
        failureCount++;
      }
    }

    // Log summary
    console.log(`\n${"─".repeat(60)}`);
    console.log(`[SUMMARY] 📊 Notification Send Results:`);
    console.log(`  • Total tokens: ${tokenRes.rows.length}`);
    console.log(`  • Successful: ${successCount}`);
    console.log(`  • Failed: ${failureCount}`);
    console.log(`  • Invalid tokens: ${invalidTokenCount}`);
    console.log(`${"─".repeat(60)}\n`);

    // Save to database
    await pool.query(
      `INSERT INTO notifications 
        (user_id, type, title, body, url, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [
        userId,
        type || "general",
        notificationTitle,
        notificationBody,
        targetUrl,
      ]
    );
    console.log(`[DB] ✅ Notification saved to database`);

    // Prepare log object
    const notificationLog: NotificationLog = {
      userId,
      title: notificationTitle,
      body: notificationBody,
      type: type || "general",
      url: targetUrl,
      timestamp,
      totalTokens: tokenRes.rows.length,
      successCount,
      failureCount,
      invalidTokenCount,
      tokenResults,
    };

    // Send email log (async, don't wait)
    sendNotificationLogEmail(notificationLog).catch((err) =>
      console.error("[EMAIL] Error sending log email:", err)
    );

    console.log(
      `[${new Date().toISOString()}] 🏁 PUSH NOTIFICATION REQUEST COMPLETED`
    );
    console.log(`${"=".repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      summary: {
        totalTokens: tokenRes.rows.length,
        successCount,
        failureCount,
        invalidTokenCount,
      },
      tokenResults: tokenResults.map((r) => ({
        tokenPreview: r.tokenPreview,
        isValid: r.isValid,
        sent: r.sent,
        messageId: r.messageId,
        error: r.error,
        errorCode: r.errorCode,
      })),
      message:
        failureCount === 0
          ? "All notifications sent successfully"
          : `${successCount} sent, ${failureCount} failed`,
    });
  } catch (err: any) {
    console.error(`[ERROR] ❌ Unexpected error:`, err);
    console.log(`${"=".repeat(60)}\n`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
