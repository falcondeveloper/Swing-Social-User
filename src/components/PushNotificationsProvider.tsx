"use client";
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { getMessaging, Messaging, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

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
  const [isClient, setIsClient] = useState(false);
  const [messaging, setMessaging] = useState<Messaging | undefined>(undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    try {
      if (
        isClient &&
        "serviceWorker" in navigator &&
        "Notification" in window
      ) {
        const app = initializeApp(firebaseConfig);
        const messagingInstance = getMessaging(app);
        setMessaging(messagingInstance);

        const unsubscribe = onMessage(messagingInstance, async (payload) => {
          if (Notification.permission === "granted" && payload.notification) {
            const url = payload.data?.url || "/";
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(
              payload?.notification?.title || "",
              {
                body: payload.notification?.body,
                icon: "/logo.png",
                data: { url },
              }
            );
          }
        });

        return () => unsubscribe();
      } else {
        console.log("Not supported");
      }
    } catch (error) {
      alert(`Error initializing Firebase: ${error}`);
      console.log("Error initializing Firebase:", error);
    }
  }, [isClient]);

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <PushNotificationsContext.Provider value={messaging}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

export default PushNotificationsProvider;
