import { NextResponse } from "next/server";
import { Pool } from "pg";
import FormData from "form-data";
import Mailgun from "mailgun.js";

export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

interface TokenUpsertLog {
  profileId: string;
  tokenPreview: string;
  fullToken: string;
  timestamp: string;
  action: "inserted" | "updated" | "unchanged" | "error";
  previousTokenPreview?: string;
  userAgent?: string;
  ipAddress?: string;
  result?: any;
  error?: string;
}

// Helper function to mask token for privacy
function maskToken(token: string): string {
  if (!token || token.length < 20) return "INVALID_TOKEN_FORMAT";
  return `${token.substring(0, 15)}...${token.substring(token.length - 15)}`;
}

// Validate FCM token format
function validateFCMToken(token: string): { valid: boolean; reason?: string } {
  if (!token) {
    return { valid: false, reason: "Token is empty" };
  }
  if (typeof token !== "string") {
    return { valid: false, reason: "Token is not a string" };
  }
  if (token.length < 100) {
    return {
      valid: false,
      reason: `Token too short (${token.length} chars, expected 100+)`,
    };
  }
  if (token.length > 500) {
    return { valid: false, reason: `Token too long (${token.length} chars)` };
  }
  // FCM tokens typically contain only alphanumeric characters, colons, and hyphens
  if (!/^[a-zA-Z0-9:_-]+$/.test(token)) {
    return { valid: false, reason: "Token contains invalid characters" };
  }
  return { valid: true };
}

// Send email notification for token upsert
async function sendTokenUpsertEmail(log: TokenUpsertLog): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = result.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      console.error("[EMAIL] MAILGUN_KEY not found in configuration");
      return;
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    // Determine status color and icon
    const statusConfig = {
      inserted: { color: "#27ae60", icon: "🆕", label: "New Token Registered" },
      updated: { color: "#3498db", icon: "🔄", label: "Token Updated" },
      unchanged: { color: "#95a5a6", icon: "✓", label: "Token Unchanged" },
      error: { color: "#e74c3c", icon: "❌", label: "Registration Failed" },
    };

    const status = statusConfig[log.action];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>FCM Token Registration Log</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 10px;">📱 FCM Token Registration</h1>
          <p style="color: #666; margin-bottom: 30px;">Timestamp: ${
            log.timestamp
          }</p>
          
          <div style="background: ${status.color}15; border-left: 4px solid ${
      status.color
    }; padding: 15px; margin-bottom: 30px;">
            <h2 style="color: ${status.color}; margin: 0;">${status.icon} ${
      status.label
    }</h2>
          </div>
          
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Registration Details</h3>
          <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666; width: 140px;"><strong>Profile ID:</strong></td>
              <td style="padding: 12px 0; font-family: monospace;">${
                log.profileId
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;"><strong>Action:</strong></td>
              <td style="padding: 12px 0;">
                <span style="padding: 4px 12px; border-radius: 4px; background: ${
                  status.color
                }; color: white; font-size: 12px; font-weight: bold;">
                  ${log.action.toUpperCase()}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;"><strong>New Token:</strong></td>
              <td style="padding: 12px 0; font-family: monospace; font-size: 12px; word-break: break-all;">${
                log.tokenPreview
              }</td>
            </tr>
            ${
              log.previousTokenPreview
                ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;"><strong>Previous Token:</strong></td>
              <td style="padding: 12px 0; font-family: monospace; font-size: 12px; word-break: break-all;">${log.previousTokenPreview}</td>
            </tr>
            `
                : ""
            }
            ${
              log.userAgent
                ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;"><strong>User Agent:</strong></td>
              <td style="padding: 12px 0; font-size: 12px; word-break: break-all;">${log.userAgent}</td>
            </tr>
            `
                : ""
            }
            ${
              log.ipAddress
                ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;"><strong>IP Address:</strong></td>
              <td style="padding: 12px 0; font-family: monospace;">${log.ipAddress}</td>
            </tr>
            `
                : ""
            }
            ${
              log.error
                ? `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #e74c3c;"><strong>Error:</strong></td>
              <td style="padding: 12px 0; color: #e74c3c;">${log.error}</td>
            </tr>
            `
                : ""
            }
          </table>

          ${
            log.result
              ? `
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Database Result</h3>
          <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(
            log.result,
            null,
            2
          )}</pre>
          `
              : ""
          }

          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Full Token (for debugging):</h4>
            <code style="font-size: 10px; word-break: break-all; color: #666;">${
              log.fullToken
            }</code>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>This is an automated FCM token registration log from SwingSocial.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await mg.messages.create("swingsocial.co", {
      from: "SwingSocial System <system@swingsocial.co>",
      to: "your-email@example.com", // Replace with your email
      subject: `[${
        status.icon
      } ${log.action.toUpperCase()}] FCM Token - Profile ${log.profileId}`,
      html: htmlContent,
    });

    console.log("[EMAIL] ✅ Token upsert email sent successfully");
  } catch (error) {
    console.error("[EMAIL] ❌ Failed to send token upsert email:", error);
  }
}

export async function POST(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[${timestamp}] 📱 FCM TOKEN UPSERT REQUEST`);
  console.log(`${"=".repeat(60)}`);

  let log: TokenUpsertLog = {
    profileId: "",
    tokenPreview: "",
    fullToken: "",
    timestamp,
    action: "error",
  };

  try {
    // Extract headers for logging
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      undefined;

    const { profileId, token } = await req.json();

    log.profileId = profileId || "MISSING";
    log.fullToken = token || "MISSING";
    log.tokenPreview = token ? maskToken(token) : "MISSING";
    log.userAgent = userAgent;
    log.ipAddress = ipAddress;

    console.log(`[INFO] Profile ID: ${profileId}`);
    console.log(`[INFO] Token Preview: ${log.tokenPreview}`);
    console.log(`[INFO] User Agent: ${userAgent || "Not provided"}`);
    console.log(`[INFO] IP Address: ${ipAddress || "Not provided"}`);

    // Validate inputs
    if (!profileId || !token) {
      console.log(`[ERROR] ❌ Missing required fields`);
      console.log(`  - profileId: ${profileId ? "✓" : "✗ MISSING"}`);
      console.log(`  - token: ${token ? "✓" : "✗ MISSING"}`);

      log.action = "error";
      log.error = "profileId and token are required";

      // Send email for failed attempt
      sendTokenUpsertEmail(log).catch(console.error);

      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "profileId and token are required",
        },
        { status: 400 }
      );
    }

    // Validate token format
    const tokenValidation = validateFCMToken(token);
    if (!tokenValidation.valid) {
      console.log(`[ERROR] ❌ Invalid token format: ${tokenValidation.reason}`);

      log.action = "error";
      log.error = `Invalid token format: ${tokenValidation.reason}`;

      sendTokenUpsertEmail(log).catch(console.error);

      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: `Invalid FCM token: ${tokenValidation.reason}`,
        },
        { status: 400 }
      );
    }

    console.log(`[INFO] ✅ Token format validation passed`);

    // Check for existing token
    console.log(`[DB] Checking for existing token...`);
    const existingToken = await pool.query(
      `SELECT token FROM fcm_tokens WHERE profile_id = $1 LIMIT 1`,
      [profileId]
    );

    if (existingToken.rows.length > 0) {
      const previousToken = existingToken.rows[0].token;
      log.previousTokenPreview = maskToken(previousToken);
      console.log(`[DB] Found existing token: ${log.previousTokenPreview}`);

      if (previousToken === token) {
        console.log(`[INFO] Token unchanged - same as existing`);
        log.action = "unchanged";
      } else {
        console.log(`[INFO] Token will be updated`);
        log.action = "updated";
      }
    } else {
      console.log(`[DB] No existing token found - will insert new`);
      log.action = "inserted";
    }

    // Perform upsert
    console.log(`[DB] Executing upsert_fcm_token...`);
    const result = await pool.query(
      `SELECT * FROM public.upsert_fcm_token($1, $2)`,
      [profileId, token]
    );

    log.result = result.rows?.[0] ?? null;

    console.log(`[DB] ✅ Upsert successful`);
    console.log(`[DB] Result:`, log.result);

    // Log to database (optional - create this table if you want persistent logs)
    try {
      await pool.query(
        `INSERT INTO fcm_token_logs 
          (profile_id, token_preview, action, user_agent, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT DO NOTHING`,
        [profileId, log.tokenPreview, log.action, userAgent, ipAddress]
      );
      console.log(`[DB] ✅ Token log saved`);
    } catch (logError) {
      // Table might not exist, that's okay
      console.log(
        `[DB] ℹ️ Could not save to fcm_token_logs (table may not exist)`
      );
    }

    console.log(`\n${"─".repeat(60)}`);
    console.log(`[SUMMARY] 📊 Token Registration Result:`);
    console.log(`  • Profile ID: ${profileId}`);
    console.log(`  • Action: ${log.action.toUpperCase()}`);
    console.log(`  • Token: ${log.tokenPreview}`);
    console.log(`${"─".repeat(60)}`);

    // Send email notification
    sendTokenUpsertEmail(log).catch(console.error);

    console.log(`[${new Date().toISOString()}] 🏁 FCM TOKEN UPSERT COMPLETED`);
    console.log(`${"=".repeat(60)}\n`);

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "FCM token saved successfully",
        action: log.action,
        tokenPreview: log.tokenPreview,
        result: result.rows?.[0] ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[ERROR] ❌ Database query failed:`, error);

    log.action = "error";
    log.error = error instanceof Error ? error.message : "Unknown server error";

    // Send email for error
    sendTokenUpsertEmail(log).catch(console.error);

    console.log(`${"=".repeat(60)}\n`);

    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: "Failed to save FCM token",
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
