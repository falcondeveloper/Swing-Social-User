"use client";

import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

export default function NotificationInit() {
  useEffect(() => {
    console.log("Client loaded");

    async function askPermission() {
      if (!messaging) {
        console.error("Messaging instance missing");
        return;
      }

      const permission = await Notification.requestPermission();
      console.log("Permission:", permission);

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey:
            "BIDy2RbO49rCl4PiCwOEjNbG-iewNN5s19EohjSo5CeGiiMJsS-isosbF2J0Rb7FiSv_3yhJageGnXP5f6N6nag",
        });
        console.log("token:", token);
      }
    }

    askPermission();

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log("Foreground message:", payload);

        if (document.hasFocus()) {
          alert(payload.notification?.title);
        }

        new Notification(payload.notification?.title ?? "New message", {
          body: payload.notification?.body,
          icon: "/favicon.png",
        });
      });
    }
  }, []);

  return null;
}
