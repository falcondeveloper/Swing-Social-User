"use client";
import { useEffect, useState } from "react";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import firebaseApp from "../../firebase";

const useFcmToken = () => {
  const [token, setToken] = useState("");
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission | "unsupported" | "">("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initializeFCM = async () => {
      try {
        const isFcmSupported = await isSupported();
        if (!isFcmSupported) {
          setNotificationPermissionStatus("unsupported");
          setError("Firebase Cloud Messaging is not supported in this browser");
          return;
        }

        if (!("serviceWorker" in navigator)) {
          setError("Service Worker is not supported in this browser");
          return;
        }

        const messaging = getMessaging(firebaseApp);

        const permission = await Notification.requestPermission();
        setNotificationPermissionStatus(permission);

        if (permission !== "granted") {
          setError("Notification permission denied");
          return;
        }

        let serviceWorkerRegistration;
        try {
          serviceWorkerRegistration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");

          if (!serviceWorkerRegistration) {
            serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
              scope: "/",
            });
            console.log("Service Worker registered:", serviceWorkerRegistration);
          }
        } catch (swError) {
          console.error("Service Worker registration failed:", swError);
          setError("Failed to register Service Worker");
          return;
        }

        await navigator.serviceWorker.ready;

        const currentToken = await getToken(messaging, {
          vapidKey: "BJ_sUo9JKNgQ_knM67BejMvIPs7_K_YSR3M3FB44zOxFaM9OPxTqbBTpiDIPGyY7JBM6Uym0GnZzQKWAigh_OWI",
          serviceWorkerRegistration,
        });

        if (currentToken) {
          console.log("FCM token retrieved:", currentToken);
          setToken(currentToken);

        } else {
          setError("No token available");
        }

        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
        });

      } catch (err) {
        console.error("Error initializing FCM:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    initializeFCM();
  }, []);

  return { token, notificationPermissionStatus, error };
};

export default useFcmToken;