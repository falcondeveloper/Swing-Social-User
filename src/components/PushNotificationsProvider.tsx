"use client";

import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, Messaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
  authDomain: "swing-social-website-37364.firebaseapp.com",
  projectId: "swing-social-website-37364",
  storageBucket: "swing-social-website-37364.firebasestorage.app",
  messagingSenderId: "24751189898",
  appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
};

export const PushNotificationsContext = createContext<Messaging | undefined>(
  undefined
);

const PushNotificationsProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [messaging, setMessaging] = useState<Messaging>();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("Notification" in window)
    ) {
      return;
    }

    const init = async () => {
      try {
        // 🔒 Ask permission once
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }

        if (Notification.permission !== "granted") return;

        // 🔥 Init Firebase once
        const app =
          getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

        const messagingInstance = getMessaging(app);
        setMessaging(messagingInstance);

        const unsubscribe = onMessage(messagingInstance, (payload) => {
          const data = payload.data;

          // ✅ Type guard (fixes TS18048)
          if (!data) return;

          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(data.title ?? "SwingSocial", {
              body: data.body ?? "New notification",
              icon: data.icon ?? "/logo.svg",
              badge: "/logo.svg",
              data: {
                url: data.url ?? "/",
              },
            });
          });
        });

        return unsubscribe;
      } catch (err) {
        console.error("FCM init error:", err);
      }
    };

    init();
  }, []);

  return (
    <PushNotificationsContext.Provider value={messaging}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

export default PushNotificationsProvider;
