"use client";
import { useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/firebase-messaging-sw.js").then(
          (registration) => {
            console.log("SW registered: ", registration);
          },
          (error) => {
            console.log("SW registration failed: ", error);
          }
        );
      });
    }
  }, []);
  return <>{children}</>;
}
