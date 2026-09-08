import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Post a requirement | GoPratle',
  description: 'Tell GoPratle what your event needs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
