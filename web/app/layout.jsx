import './globals.css';

export const metadata = {
  title: 'kickflip — get paid to wait',
  description:
    'Sponsored spinner lines for Codex, Gemini CLI, and every coding agent. Install the wrapper, keep 75% of the ad revenue.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
