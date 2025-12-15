"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export const useFCMToken = () => {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (!messaging) return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;

    const fcm: Messaging = messaging;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("✅ SW registered", reg);

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const fcmToken = await getToken(fcm, {
          vapidKey: "BIDy2RbO49rCl4PiCwOEjNbG-iewNN5s19EohjSo5CeGiiMJsS-isosbF2J0Rb7FiSv_3yhJageGnXP5f6N6nag",
          serviceWorkerRegistration: reg,
        });

        if (fcmToken) {
          console.log("🔥 FCM TOKEN:", fcmToken);
          setToken(fcmToken);
        }
      } catch (err) {
        console.error("❌ FCM ERROR:", err);
      }
    };

    register();

    onMessage(fcm, (payload) => {
      console.log("📩 Foreground:", payload);
    });
  }, []);
  return token;
};
