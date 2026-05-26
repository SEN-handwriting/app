import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Sen } from "next/font/google";

import "./globals.css";
import { ReactQueryProvider } from "#/providers/ReactQueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import Script from "next/script";
import { Navbar } from "#/components/layouts/Navbar";
import { BottomNav } from "#/components/layouts/BottomNav";
import { Analytics } from "@vercel/analytics/next";

const fontSans = Sen({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = IBM_Plex_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sen — Learn the Line",
  description: "Apprends à écrire les écritures du monde",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sen",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scrollbar-thin selection:bg-primary-600 scheme-dark"
    >
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans`}>
        <TooltipProvider>
          <ReactQueryProvider>
            <ReactQueryDevtools />

            <div className="pointer-events-none fixed inset-0 -z-10">
              <div className="bg-primary-400 absolute top-0 left-0 aspect-square size-1/2 rounded-full blur-[100vw]" />
              <div className="absolute right-0 bottom-0 size-1/2 rounded-full bg-[#0083D4] blur-[100vw]" />
            </div>

            <Script
              id="sw-register"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
              }}
            />
            <Navbar />
            <div className="pt-16">{children}</div>
            <BottomNav />
          </ReactQueryProvider>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
