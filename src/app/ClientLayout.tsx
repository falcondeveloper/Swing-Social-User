"use client"; // This directive is crucial

import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
          }
        });
      }
    }

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground Message received:", payload);

        const title = payload.notification?.title || "New Message";
        const body =
          payload.notification?.body || "You have a new notification";
        const icon = "/logo.png";

        new Notification(title, {
          body: body,
          icon: icon,
        });
      });

      return () => unsubscribe();
    }
  }, []);

  return <>{children}</>;
}
