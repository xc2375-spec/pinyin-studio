import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinyin Studio · Mandarin I",
  description: "A mobile pronunciation lab for university learners of Mandarin Chinese.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Pinyin Studio",
    description: "A mobile pronunciation lab for university learners",
    images: ["/pinyin-studio-social.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinyin Studio",
    description: "A mobile pronunciation lab for university learners",
    images: ["/pinyin-studio-social.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
