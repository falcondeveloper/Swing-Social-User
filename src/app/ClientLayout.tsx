"use client";

import React, { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Ask permission first if not granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const messaging = getMessaging(app);

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔥 Foreground message received:", payload);

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "New Notification";
      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "You have a message";

      new Notification(title, { body });
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
