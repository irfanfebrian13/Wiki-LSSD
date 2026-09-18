import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

/* Space Grotesk for display, Inter for body/UI, JetBrains Mono for anything a
   deputy reads off a screen mid-shift (codes, callsigns, plates, generated
   output) — the reference's type system. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LSSD Deputy Pocketbook",
  description:
    "Los Santos Sheriff Department — Deputy Pocketbook. Ten codes, procedures, penal code and patrol report generator.",
  applicationName: "LSSD Pocketbook",
  icons: { icon: "/sheriff.png" },
  other: { "theme-color": "#0c0e12" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Applies the stored theme before first paint.
 *
 * Without this the document renders with the default (dark) tokens and then
 * snaps to the stored preference once React hydrates — a visible flash. It runs
 * as a blocking inline script, so it must stay tiny and must never throw: a
 * locked-down browser can deny `localStorage` access entirely.
 *
 * It also syncs the mobile browser chrome colour, which is why the two values
 * are duplicated from the token sheet rather than read from CSS.
 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem("lssd-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f3f4f7":"#0c0e12")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-theme="dark"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      // The inline script below sets data-theme before hydration, so the
      // server markup and the client tree can legitimately differ here.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
