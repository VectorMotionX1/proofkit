import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "ProofKit",
  description: "A focused client approval workspace for small agencies.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
