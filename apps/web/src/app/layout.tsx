import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autonomous Incident Agent",
  description: "AI-powered incident detection and resolution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("your_");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {hasClerkKeys ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
