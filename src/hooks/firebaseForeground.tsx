"use client";

import { useEffect } from "react";
import useFcmToken from "./useFCMToken";

export default function FcmTokenComp() {
  const { token, notificationPermissionStatus, error } = useFcmToken();

  if (process.env.NODE_ENV === "development") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 8,
          left: 8,
          padding: 8,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          fontSize: 12,
          borderRadius: 4,
          maxWidth: "80vw",
          zIndex: 9999,
          wordBreak: "break-all",
        }}
      >
        <div>
          <strong>FCM Status:</strong>
        </div>
        <div>Permission: {notificationPermissionStatus}</div>
        <div>Token: {token ? "✅" : "❌"}</div>
        {token && (
          <div style={{ fontSize: 10 }}>Token: {token.substring(0, 20)}...</div>
        )}
        {error && <div style={{ color: "#ff6b6b" }}>Error: {error}</div>}
      </div>
    );
  }

  return null;
}
