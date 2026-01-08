"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/commonPage/Loader";

const UserSelectionPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenDevice = localStorage.getItem("loginInfo");
      if (tokenDevice) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <Loader />;
  }

  return null;
};

export default UserSelectionPage;
