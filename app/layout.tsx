import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Partner Finder | 함다연 포트폴리오",
  description:
    "학생회 100개 제휴처 발굴 경험 기반 — 행사 유형·예산·타겟에 따라 최적 제휴 업종과 마케팅 전략을 추천하는 데이터 기반 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
