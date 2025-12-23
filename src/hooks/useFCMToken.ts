"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export const useFCMToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!messaging) {
      setError("Firebase messaging not initialized");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setError("Service workers not supported");
      return;
    }

    if (!window.isSecureContext) {
      setError("App must be served over HTTPS");
      return;
    }

    const fcm: Messaging = messaging;
    let unsubscribe: (() => void) | undefined;

    const register = async () => {
      try {
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Check if already registered
        const existingReg = await navigator.serviceWorker.getRegistration();

        const reg = existingReg || await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        );

        console.log("✅ Service Worker registered:", reg);

        // Wait for service worker to be active
        if (reg.installing) {
          await new Promise((resolve) => {
            reg.installing!.addEventListener("statechange", (e: any) => {
              if (e.target.state === "activated") resolve(null);
            });
          });
        }

        // Request notification permission
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        console.log("🔔 Notification permission:", permission);

        if (permission !== "granted") {
          setError("Notification permission denied");
          return;
        }

        // Get FCM token
        const fcmToken = await getToken(fcm, {
          vapidKey: "BIDy2RbO49rCl4PiCwOEjNbG-iewNN5s19EohjSo5CeGiiMJsS-isosbF2J0Rb7FiSv_3yhJageGnXP5f6N6nag",
          serviceWorkerRegistration: reg,
        });

        if (fcmToken) {
          setToken(fcmToken);
          console.log("🔑 FCM Token:", fcmToken);
        } else {
          setError("Failed to get FCM token");
        }

        // Handle foreground messages
        unsubscribe = onMessage(fcm, async (payload) => {
          console.log("🔥 Foreground message received:", payload);

          // Check if document is visible
          if (document.visibilityState === "visible") {
            const title =
              payload.notification?.title ||
              payload.data?.title ||
              "New Notification";

            const body =
              payload.notification?.body ||
              payload.data?.body ||
              "You have a new message";

            const clickUrl = payload.fcmOptions?.link || payload.data?.url || "/";

            // Show notification
            if (reg && reg.active) {
              try {
                await reg.showNotification(title, {
                  body,
                  icon: "/logo.png",
                  badge: "/logo.png",
                  data: { url: clickUrl },
                  tag: payload.data?.notificationId || payload.messageId || `notification-${Date.now()}`,
                  requireInteraction: false,
                });
                console.log("✅ Notification shown");
              } catch (notifError) {
                console.error("❌ Error showing notification:", notifError);
              }
            }
          }
        });

        console.log("✅ FCM setup complete");
      } catch (err) {
        console.error("❌ FCM Setup Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    register();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log("🧹 Cleaned up onMessage listener");
      }
    };
  }, []);

  return { token, notificationPermission, error };
};