import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elegante Carpet LLC — Estimator",
  description: "Professional carpet estimator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
