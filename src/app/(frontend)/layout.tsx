import type { Metadata } from "next";
import { Inter, Dancing_Script, Playfair_Display } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avnera - Craft meets couture | Ethnic & Indo-Western Fashion",
  description: "Discover elegant ethnic and indo-western fashion at Avnera. Explore co-ord sets, drape sarees, jumpsuits and more. Craft meets couture in every design.",
  keywords: "ethnic wear, indo-western, fashion, sarees, co-ord sets, jumpsuits, avnera, craft meets couture",
  authors: [{ name: "Avnera Fashion" }],
  openGraph: {
    title: "Avnera - Craft meets couture",
    description: "Elegant ethnic and indo-western fashion",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      {/* suppressHydrationWarning is used here to prevent false positives from browser extensions 
          that inject attributes like __processed_* and bis_register into the body tag */}
      <body className="font-body antialiased bg-white text-charcoal overflow-x-hidden" suppressHydrationWarning={true}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
