"use client";

import React from "react";
import FcmTokenComp from "@/hooks/firebaseForeground";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      {children}
      <FcmTokenComp />
    </>
  );
}
