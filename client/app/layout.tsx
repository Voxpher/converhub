import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Online File Converter`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Online File Converter`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Free Online File Converter`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="gtag-stub"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              'window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}',
          }}
        />
        {ADSENSE_CLIENT && (
          <Script
            id="adsense"
            strategy="afterInteractive"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <ThemeProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <ConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
