import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Navigation } from "@/components/layout/Navigation";
import TopRightLogo from "@/components/layout/TopRightLogo";
import ActiveWorkoutDrawer from "@/components/layout/ActiveWorkoutDrawer";
import NotificationToast from "@/components/ui/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export const metadata: Metadata = {
  title: "EraFit // Healthcare Platform",
  description: "AI healthcare and fitness platform.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EraFit",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-on-surface flex flex-col antialiased selection:bg-primary-fixed selection:text-white">
        <AuthProvider>
          <AppProvider>
            <Navigation />
            <TopRightLogo />
            <main className="flex-1 md:pl-64 pt-6 md:pt-8 pb-24 md:pb-8">{children}</main>
            <ActiveWorkoutDrawer />
            <NotificationToast />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
