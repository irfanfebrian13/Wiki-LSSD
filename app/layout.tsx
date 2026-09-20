import type { Metadata, Viewport } from "next";
import {
  Barlow_Condensed,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";

import "./globals.css";

/* Fraunces for headings, chapter numerals, TOC titles, rank names and quoted
   blocks. Variable font — no explicit weights needed. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

/* IBM Plex Sans for body copy at 16px/1.6. Not a variable font, so every weight
   in use must be listed. */
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* IBM Plex Mono for codes, labels, scripts and generated output. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* Barlow Condensed, uppercase and letter-spaced, for the category tabs and the
   rank tier names. */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600"],
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
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} ${barlowCondensed.variable}`}
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
