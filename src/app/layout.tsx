import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Učitel roku | Hlasování",
  description: "Hlasování o nejlepšího učitele roku na naší škole",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className="antialiased bg-bg min-h-screen text-slate-800">
        {children}
      </body>
    </html>
  );
}
