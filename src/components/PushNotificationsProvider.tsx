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
    const init = async () => {
      try {
        if (
          isClient &&
          "serviceWorker" in navigator &&
          "Notification" in window
        ) {
          if (!navigator.serviceWorker.controller) {
            await navigator.serviceWorker.register(
              "/firebase-messaging-sw.js",
              { scope: "/" }
            );
          }

          await navigator.serviceWorker.ready;

          const app = initializeApp(firebaseConfig);
          const messagingInstance = getMessaging(app);
          setMessaging(messagingInstance);

          const unsubscribe = onMessage(messagingInstance, (payload) => {
            console.log("Foreground FCM payload:", payload);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Firebase init error:", error);
      }
    };

    init();
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
