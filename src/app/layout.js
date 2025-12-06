import { Itim } from "next/font/google"; // หรือฟอนต์เดิมที่คุณใช้
import "./globals.css";

const itim = Itim({ 
  subsets: ["thai", "latin"], 
  weight: ["400"], 
  variable: "--font-itim",
});

// 1. metadata (เก็บแค่ Title, Description, Manifest)
export const metadata = {
  title: "EasyWay",
  description: "Transportation Helper App",
  manifest: "/manifest.json",
};

// 2. viewport (แยกออกมาต่างหาก ตามกฎใหม่ Next.js)
export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // กันไม่ให้ User ซูมหน้าจอ
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={itim.className}>{children}</body>
    </html>
  );
}