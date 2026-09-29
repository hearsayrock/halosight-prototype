import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halosight",
  description: "AI-powered field sales intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("halosight-theme")==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}`,
          }}
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
