"use client";

import { useMediaQuery } from "@mui/material";
import MobileChat from "./components/MobileChat";
import DesktopChat from "./components/DesktopChat";

export default function ChatPage() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return isMobile ? <MobileChat /> : <DesktopChat />;
}
