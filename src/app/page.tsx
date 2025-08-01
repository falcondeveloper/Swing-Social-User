"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const UserSelectionPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, []);

  return <></>;
};

export default UserSelectionPage;
