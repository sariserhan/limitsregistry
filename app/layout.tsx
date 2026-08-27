import type { Metadata } from "next";
import "./globals.css";
import "./canonical.css";

export const metadata: Metadata = {
  title: "Limits Registry — The verified boundaries of what is possible",
  description: "A curated public record of mathematical and theoretical computer science limits.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
