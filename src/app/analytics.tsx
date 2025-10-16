"use client";

import Script from "next/script";

export default function Analytics() {
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-JPKH2Y414N`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JPKH2Y414N', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
