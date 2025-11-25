"use client";

import React from "react";
import NotificationHandler from "../hooks/useFCMToken";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <NotificationHandler />
      {children}
    </>
  );
}
