"use client";

import { useEffect, useState } from "react";

export default function NotificationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;

    const dismissed = localStorage.getItem("notificationModalDismissed");
    if (dismissed === "true") return;

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
        <div style={{ fontSize: 30 }}>🔔</div>

        <h2 style={title}>Turn On Notifications</h2>

        <p style={description}>
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
  padding: 18, // reduced
  width: "90%",
  maxWidth: 320, // reduced
  borderRadius: 14,
  color: "#000",
  textAlign: "center",
  boxShadow: "0 16px 30px rgba(0,0,0,0.25)",
};

const title: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 6,
  fontSize: 18, // reduced
};

const description: React.CSSProperties = {
  color: "#666",
  fontSize: 13, // reduced
  marginBottom: 14,
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  color: "#fff",
  background: "linear-gradient(135deg, #ff4d6d, #ff758f)",
  marginBottom: 8,
};

const secondaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  background: "transparent",
  border: "none",
  color: "#777",
  fontSize: 12,
  cursor: "pointer",
};
