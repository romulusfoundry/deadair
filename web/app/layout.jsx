import './globals.css';

export const metadata = {
  metadataBase: new URL('https://deadair.online'),
  title: 'deadair — sell your dead air',
  description:
    'Open-source terminal ad network: a sponsored line in your AI coding agent\'s spinner pays you a share of the ad revenue. Native ads in Codex + Gemini CLI, banners for every other agent. First 1,000 installs keep 75% forever.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'deadair — sell your dead air',
    description:
      'A sponsored line in your AI coding agent\'s spinner pays you a share of the ad revenue. Open source, no tracking, uninstalls clean.',
    url: 'https://deadair.online',
    siteName: 'deadair',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'deadair — sell your dead air',
    description:
      'A sponsored line in your AI coding agent\'s spinner pays you a share of the ad revenue. npm i -g deadair'
  }
};

// JSON-LD so AI search + crawlers parse what deadair is, not just scrape prose.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'deadair',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  description:
    'Open-source terminal ad network. Puts a sponsored line in your AI coding agent\'s spinner and pays you a share of the ad revenue. Native ads in Codex and Gemini CLI; sponsored banners for every other agent.',
  url: 'https://deadair.online',
  downloadUrl: 'https://www.npmjs.com/package/deadair',
  softwareHelp: 'https://github.com/romulusfoundry/deadair',
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Organization', name: 'Wendell Labs' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
