import { Kanit } from "next/font/google"; // 1. Import ตัวพิมพ์ใหญ่
import "./globals.css";

// 2. ประกาศตัวแปร (ใช้ชื่อ kanit ตัวเล็ก) = เรียกฟังก์ชัน Kanit (ตัวใหญ่)
const kanit = Kanit({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

export const metadata = {
  title: "EasyWay",
  description: "Transportation Helper App",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 3. เรียกใช้ className จากตัวแปร kanit (ตัวเล็ก) */}
      <body className={kanit.className}>{children}</body>
    </html>
  );
}