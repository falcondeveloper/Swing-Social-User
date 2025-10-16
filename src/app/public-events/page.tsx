import { Metadata } from "next";
import PublicEvents from "@/components/PublicEvents";
import React from "react";

const BASE_URL = "https://swing-social-user.vercel.app/";

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch top 1-2 events for dynamic SEO
    const res = await fetch("/api/user/events/publicEvents", {
      next: { revalidate: 60 * 60 },
    });
    const data = await res.json();
    const topEvent = data?.events?.[0];

    const title = topEvent
      ? `Discover Local Events | ${topEvent.Name} & More | https://swing-social-user.vercel.app/public-events`
      : "Discover Local Events Near You | https://swing-social-user.vercel.app/public-events";

    const description =
      topEvent?.Description?.slice(0, 160) ||
      "Find and join exciting local events, workshops, and meetups near you. Sign up to RSVP, save events, and connect with others.";

    const image =
      topEvent?.CoverImageUrl || `${BASE_URL}/images/og-events-cover.jpg`;

    const canonicalUrl = `${BASE_URL}/events`;

    // JSON-LD structured data for Google rich results
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": (data?.events?.slice(0, 5) || []).map((ev: any) => ({
        "@type": "Event",
        "@id": `${BASE_URL}/events/${ev.Id}`,
        name: ev.Name,
        startDate: new Date(ev.StartTime).toISOString(),
        location: ev.Venue || { "@type": "Place", name: "Online / Venue TBA" },
        description: ev.Description || "",
        image:
          ev.CoverImageUrl || `${BASE_URL}/images/event-placeholder-mobile.jpg`,
        eventStatus: "https://schema.org/EventScheduled",
        url: `${BASE_URL}/events/detail/${ev.Id}`,
        performer: { "@type": "PerformingGroup", name: ev.Category || "Event" },
      })),
    };

    return {
      title,
      description,
      keywords: [
        "events near me",
        "local events",
        "workshops",
        "networking",
        "free events",
        "meetups",
      ],
      alternates: { canonical: canonicalUrl },
      robots: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "website",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: topEvent?.Name || "Local Events Banner",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      other: {
        "script:type": "application/ld+json",
        "script:innerHTML": JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Events | Discover Local Events | https://swing-social-user.vercel.app/public-events",
      description:
        "Join the best local events and meet people near you. Sign up free to RSVP and stay updated.",
      robots: { index: true, follow: true },
    };
  }
}

const page = () => {
  return (
    <>
      <PublicEvents />
    </>
  );
};

export default page;
