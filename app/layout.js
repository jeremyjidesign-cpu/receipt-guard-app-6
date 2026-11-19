import './globals.css';
import { Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google';
import Shell from '@/components/Shell';
import SWRegister from '@/components/SWRegister';

const font = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' });

const splash = (w, h, dw, dh, r) => ({
  url: `/splash/${w}x${h}.png`,
  media: `(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`,
});

export const metadata = {
  title: 'Receipt Guard',
  description: 'Keep receipts, beat return deadlines, catch recalls.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true, title: 'Receipt Guard', statusBarStyle: 'default',
    startupImage: [
      splash(750, 1334, 375, 667, 2), splash(828, 1792, 414, 896, 2), splash(1125, 2436, 375, 812, 3),
      splash(1170, 2532, 390, 844, 3), splash(1179, 2556, 393, 852, 3), splash(1284, 2778, 428, 926, 3), splash(1290, 2796, 430, 932, 3),
    ],
  },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
};
export const viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#0F6B57' }, { media: '(prefers-color-scheme: dark)', color: '#0C1412' }],
  colorScheme: 'light dark', width: 'device-width', initialScale: 1, viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU" className={`${font.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Shell>{children}</Shell>
        <SWRegister />
      </body>
    </html>
  );
}
