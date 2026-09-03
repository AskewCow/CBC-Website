import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jbmono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8443"),
  title: {
    default: "Claude Builder Club",
    template: "%s · Claude Builder Club",
  },
  description:
    "The Claude Builder Club at Trinity College Dublin — a student society that ships real AI applications with Claude and the Anthropic API. See what members have built, upcoming events, and how to join.",
  applicationName: "Claude Builder Club",
  openGraph: {
    title: "Claude Builder Club",
    description:
      "A Trinity College Dublin student society building real AI applications with Claude. Projects, events, and how to join.",
    siteName: "Claude Builder Club",
    locale: "en_IE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Claude Builder Club",
    description:
      "A Trinity College Dublin student society building real AI applications with Claude.",
  },
  // Flip to `{ index: true, follow: true }` at launch.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="min-h-full bg-background text-foreground">
          <Nav />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
