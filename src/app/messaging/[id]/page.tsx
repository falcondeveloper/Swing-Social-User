"use client";

import { useMediaQuery } from "@mui/material";
import { useParams } from "next/navigation";
import MobileChatList from "./MobileChatList";
import DesktopChatList from "./DesktopChatList";

export default function ChatPage() {
  const isMobile = useMediaQuery("(max-width:768px)");
  const params = useParams<{ id?: string }>();

  return isMobile ? (
    <MobileChatList userId={params?.id} />
  ) : (
    <DesktopChatList userId={params?.id} />
  );
}
