"use client";

import { useEffect } from "react";
import useFcmToken from "@/hooks/useFCMToken";
import { jwtDecode } from "jwt-decode";

function TokenManager() {
  const { token } = useFcmToken();

  useEffect(() => {
    const storeDeviceToken = async () => {
      if (!token) return;

      const loginToken = localStorage.getItem("loginInfo");
      if (!loginToken) return;

      try {
        const profile = jwtDecode<any>(loginToken);
        const payload = {
          token: token,
          profile: profile,
        };

        const response = await fetch("/api/user/devicetoken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error storing device token:", errorData);
        }
      } catch (error) {
        console.error("Error processing device token:", error);
      }
    };

    storeDeviceToken();
  }, [token]);

  return null;
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <TokenManager />
      
      {children}
    </>
  );
}
