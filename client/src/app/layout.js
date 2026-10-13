import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/app/providers';
import { REMOVE_EXTENSION_ATTRIBUTES_SCRIPT } from '@/lib/extensionAttributes';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: {
    default: 'Mindcraft Digital Studio',
    template: '%s · Mindcraft Digital Studio',
  },
  description:
    'A creative workspace to generate, edit, transform, analyze and organize AI images',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          dangerouslySetInnerHTML={{
            __html: REMOVE_EXTENSION_ATTRIBUTES_SCRIPT,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
