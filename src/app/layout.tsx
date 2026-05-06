import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SheGymZ Member Space',
  description: 'Private member space for SheGymZ scheduling, bookings, and wellness access.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
