'use client';

import useFcmToken from "@/hooks/useFCMToken";
import { getMessaging, onMessage, MessagePayload } from "firebase/messaging";
import firebaseApp from "../../firebase";
import { useEffect } from "react";

export default function FcmTokenComp() {
  const { token, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this environment");
      return;
    }

    if (notificationPermissionStatus !== "granted") {
      console.info("Notification permission not granted");
      return;
    }

    try {
      const messaging = getMessaging(firebaseApp);

      const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
        try {
          if (!payload?.notification) {
            console.warn("Received payload without notification data");
            return;
          }

          const { title, body, icon } = payload.notification;
          const notificationUrl = payload.data?.url;

          if (Notification.permission === "granted") {
            const notification = new Notification(title || "New Notification", {
              body: body || "You have a new notification",
              icon: icon || "/favicon.ico",
              badge: "/favicon.ico", // Default badge icon
              requireInteraction: true,
            });

            // Handle notification click
            notification.onclick = () => {
              if (notificationUrl) {
                window.open(notificationUrl, "_blank");
              }
              window.focus();
              notification.close();
            };
          } else {
            console.warn("Notification permission was not granted despite earlier check");
          }
        } catch (error) {
          console.error("Error displaying notification:", error);
        }
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up message listener:", error);
    }
  }, [notificationPermissionStatus]);

  return null;
}