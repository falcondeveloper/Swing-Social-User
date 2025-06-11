"use client";

import { useEffect } from "react";
import useFcmToken from "@/hooks/useFCMToken";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TokenManager() {
  const { token } = useFcmToken();

  useEffect(() => {
    const storeDeviceToken = async () => {
      if (!token) return;

      const loginToken = localStorage.getItem('loginInfo');
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
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          borderRadius: "12px",
          border: "1px solid rgba(255, 27, 107, 0.2)",
          backdropFilter: "blur(10px)",
        }}
        progressStyle={{
          backgroundColor: "#FF1B6B",
        }}
        style={{
          // Mobile responsive positioning
          top: typeof window !== 'undefined' && window.innerWidth <= 768 ? "70px" : "85px",
        }}
      />
    </>
  );
}