import type { Metadata, Viewport } from "next";
import { Anton, Bebas_Neue, Geist } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--nf-anton",
  weight: "400",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--nf-bebas",
  weight: "400",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--nf-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abdullah — Immersive, motion-driven websites",
  description:
    "We design immersive, motion-driven websites that command attention and guide users to act. Clean builds. Sharp strategy. Zero fluff.",
};

export const viewport: Viewport = {
  themeColor: "#ececec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${bebas.variable} ${geist.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
