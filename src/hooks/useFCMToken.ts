"use client";

import { messaging } from "../utils/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { useEffect } from "react";

export default function NotificationHandler() {
  console.log("NotificationHandler mounted");
  useEffect(() => {
    console.log("NotificationHandler useEffect running");
    // only run in browser
    if (typeof window === "undefined") return;

    console.log("NotificationHandler running in browser");

    const requestPermission = async () => {
      console.log("Requesting notification permission");
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        try {
          console.log("Retrieving FCM token");
          const token = await getToken(messaging, {
            vapidKey:
              "BJ2LuvuUBEElBNqs8rJPepxQ-KmxZgkNF8kJoUbzGXCCNHlkymaQL1TxVE0j69NWcipcez1Xc4n1CpFcpBBOobQ",
          });
          console.log("FCM Token:", token);
        } catch (error) {
          console.log("Error retrieving token:", error);
        }
      } else {
        console.warn("Notification permission denied.");
        console.log("Notification permission was not granted by the user.");
      }
    };

    requestPermission();

    console.log("NotificationHandler set up foreground message listener");

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      new Notification(payload?.notification?.title || "New Message", {
        body: payload?.notification?.body,
      });
    });
  }, []);

  return null;
}
