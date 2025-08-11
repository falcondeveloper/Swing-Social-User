import RegisterPage from "@/pages/RegisterPage";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account",
  description:
    "Join Swing Social today! Create your account in seconds and connect with like-minded singles, couples, and communities in a safe, secure environment.",
  keywords: [
    "Swing Social",
    "Sign Up",
    "Register",
    "Create Account",
    "Lifestyle App",
    "Couples",
    "Swinger Community",
    "Dating",
  ],
  openGraph: {
    title: "Create Your Account",
    description:
      "Sign up for Swing Social and start connecting with singles and couples today.",
    url: "https://swing-social-user.vercel.app/register",
    siteName: "Swing Social",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "Swing Social Registration Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Your Account",
    description:
      "Join Swing Social today! Create your account and start exploring.",
    creator: "@swingsocial",
    images: ["/favicon.png"],
  },
};

export default function Page() {
  return (
    <>
      <RegisterPage />
    </>
  );
}
