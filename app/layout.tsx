import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://tactica-spain-lab.naciva0310.chatgpt.site"),
  title: "国家队战术板 | TACTICA",
  description: "动态理解足球阵型、位置职责和教练的攻防安排。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "TACTICA · 国家队战术板",
    description: "看见阵型如何真正移动：拆解西班牙五个攻防阶段。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "TACTICA 西班牙国家队动态战术板" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TACTICA · 国家队战术板",
    description: "看见阵型如何真正移动：拆解西班牙五个攻防阶段。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
