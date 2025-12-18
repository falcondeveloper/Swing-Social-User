"use client";
import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const initForeground = async () => {
      if (typeof window === "undefined") return;

      let reg: ServiceWorkerRegistration | undefined;

      if ("serviceWorker" in navigator) {
        reg = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
      }

      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      if (messaging && reg) {
        const unsub = onMessage(messaging, async (payload) => {

          const title =
            payload.notification?.title ||
            payload.data?.title ||
            "New Notification";
          const clickUrl = payload.fcmOptions?.link || payload.data?.url || "/";

          const options: NotificationOptions = {
            body:
              payload.notification?.body ||
              payload.data?.body ||
              "You have a message",
            icon: "/logo.png",
            badge: "/logo.png",
            data: {
              url: clickUrl,
            },
            requireInteraction: false,
            tag: `notification-${Date.now()}`,
          };
          if (reg) {
            await reg.showNotification(title, options);
          }
        });
        return unsub;
      }
    };
    initForeground();
  }, []);

  return <>{children}</>;
}
