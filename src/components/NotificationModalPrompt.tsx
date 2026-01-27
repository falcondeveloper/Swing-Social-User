"use client";

import { useEffect, useState } from "react";

export default function NotificationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;

    const dismissed = localStorage.getItem("notificationModalDismissed");
    if (dismissed === "true") return;

    // Show modal only if permission not granted
    if (Notification.permission !== "granted") {
      setOpen(true);
    }
  }, []);

  const turnOnNotification = async () => {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      localStorage.setItem("notificationModalDismissed", "true");
      setOpen(false);
    }
  };

  const closeModal = () => {
    localStorage.setItem("notificationModalDismissed", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontSize: 36 }}>🔔</div>

        <h2 style={{ marginTop: 10 }}>Turn On Notifications</h2>

        <p style={{ color: "#666", margin: "10px 0 20px" }}>
          Get notified instantly when someone likes or messages you.
        </p>

        <button style={primaryBtn} onClick={turnOnNotification}>
          🔔 Turn On Notification
        </button>

        <button style={secondaryBtn} onClick={closeModal}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  width: "90%",
  maxWidth: 380,
  borderRadius: 16,
  color: "#000",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: "none",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  color: "#fff",
  background: "linear-gradient(135deg, #ff4d6d, #ff758f)",
  marginBottom: 10,
};

const secondaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  background: "transparent",
  border: "none",
  color: "#777",
  fontSize: 13,
  cursor: "pointer",
};
