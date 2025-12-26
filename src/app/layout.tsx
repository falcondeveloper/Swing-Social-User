import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Analytics from "./analytics";
import PushNotificationsProvider from "@/components/PushNotificationsProvider";
import { SocketProvider } from "@/context/SocketProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Swing Social",
    template: "%s | Swing Social",
  },
  description:
    "Swing Social – Connect, explore, and experience a new way of social interaction with verified profiles, secure chats, and modern UI.",
  keywords: [
    "Swing Social",
    "Social Networking",
    "Swinger App",
    "Meet People",
    "Couples",
    "Lifestyle",
    "Dating",
  ],
  authors: [{ name: "Swing Social Team" }],
  metadataBase: new URL("https://swing-social-user.vercel.app"),
  openGraph: {
    title: "Swing Social",
    description:
      "Join Swing Social and discover a safe, fun, and modern space to meet like-minded people.",
    url: "https://swing-social-user.vercel.app",
    siteName: "Swing Social",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "Swing Social Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swing Social",
    description: "Join Swing Social - the modern lifestyle social platform.",
    creator: "@swingsocial",
    images: ["/favicon.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profileId =
    typeof window !== "undefined"
      ? localStorage.getItem("logged_in_profile") ?? undefined
      : undefined;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastContainer />
        <ClientLayout>
          <SocketProvider profileId={profileId}>
            <PushNotificationsProvider>{children}</PushNotificationsProvider>
          </SocketProvider>
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
