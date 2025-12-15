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
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
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
