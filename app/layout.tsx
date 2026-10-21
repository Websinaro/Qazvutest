import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GeistMono } from 'geist/font/mono';
import { Hanken_Grotesk, Young_Serif, Caveat } from 'next/font/google';
import { Intro } from '@/src/components/ui/Intro';
import { AppProviders } from '@/src/components/providers/AppProviders';
import { ThemeProvider } from '@/src/context/ThemeContext';

// The site now genuinely supports both themes (see ThemeContext + the
// `.dark` class strategy in globals.css), so we tell the browser
// `light dark` instead of the old `only light` lie. That old approach
// fought every OS/OEM auto-dark heuristic (Chrome's own, plus ColorOS's on
// Oppo devices) by refusing to admit a dark mode existed at all — which is
// also *why* it kept losing: those heuristics only override pages that
// don't declare real dark-mode support. A page that actually implements
// `prefers-color-scheme`/`.dark` correctly has nothing left for an
// auto-dark repaint to "fix". The header icons that specifically triggered
// the old bug are handled separately (theme-matched real <img> assets in
// Header/NotificationBell — see ThemeContext's resolvedTheme comment for
// why that still can't be pure CSS recoloring).
// Type: a chunky, friendly serif for headlines (Young Serif), a clean humanist
// sans for everything you read (Hanken Grotesk), a handwritten face for the
// odd margin note (Caveat) and Geist Mono for prices, counts and small labels.
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});
const young = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-young',
  display: 'swap',
});
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3eee3' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1511' },
  ],
};

export const metadata: Metadata = {
  title: 'QazvuCart: things worth bringing home',
  description: 'A high-performance, production-ready multi-vendor e-commerce marketplace featuring product discovery, dynamic delivery estimations, authenticated carts, transactional checkout, orders tracking, and customer reviews.',
  openGraph: {
    title: 'QazvuCart: things worth bringing home',
    description: 'A high-performance, production-ready multi-vendor e-commerce marketplace featuring product discovery, dynamic delivery estimations, authenticated carts, transactional checkout, orders tracking, and customer reviews.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QazvuCart: things worth bringing home',
    description: 'A high-performance, production-ready multi-vendor e-commerce marketplace featuring product discovery, dynamic delivery estimations, authenticated carts, transactional checkout, orders tracking, and customer reviews.',
  },
};

// Runs before hydration (and before first paint) so the page never renders
// one theme and then visibly snaps to the other. ThemeProvider reads the
// same localStorage key on mount and agrees with whatever class this
// script already set, so there's no client/server mismatch either.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('qazvucart-theme');
    var resolved = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    if (resolved === 'dark') root.classList.add('dark');
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

// First-visit intro gate. Repeat visits in the same session and visitors who
// prefer reduced motion never see the overlay (no flash, no scroll lock).
const introInitScript = `
(function () {
  var d = document.documentElement;
  try {
    var seen = sessionStorage.getItem('qazvucart-intro') === '1';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    d.classList.add(seen || reduce ? 'intro-skip' : 'intro-active');
  } catch (e) { d.classList.add('intro-skip'); }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${hanken.variable} ${young.variable} ${caveat.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: introInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased"
      >
        <Intro />
        <ThemeProvider>
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

