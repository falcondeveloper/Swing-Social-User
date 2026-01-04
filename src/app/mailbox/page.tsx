"use client";

import { useMediaQuery } from "@mui/material";
import MobileInbox from "./MobileInbox";
import DesktopInbox from "./DesktopInbox";

export default function ChatPage() {
  const isMobile = useMediaQuery("(max-width:768px)");

  return isMobile ? <MobileInbox /> : <DesktopInbox />;
}
