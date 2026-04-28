import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Sen } from "next/font/google";

import "./globals.css";
import { ReactQueryProvider } from "#/providers/ReactQueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { Navbar } from "#/components/layouts/Navbar";
import { BottomNav } from "#/components/layouts/BottomNav";

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
    <html lang="en" className="scrollbar-thin scheme-dark">
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans`}>
        <TooltipProvider>
          <ReactQueryProvider>
            <ReactQueryDevtools />
            <Navbar />
            <div className="pt-16">
              {children}
            </div>
            <BottomNav />
          </ReactQueryProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
