"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const UserSelectionPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenDevice = localStorage.getItem("loginInfo");
      if (tokenDevice) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, []);

  return <></>;
};

export default UserSelectionPage;
