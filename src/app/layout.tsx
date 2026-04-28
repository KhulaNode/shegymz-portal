import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SheGymZ Portal',
  description: 'Member portal for subscribed SheGymZ clients.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
