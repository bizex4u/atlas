import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATLAS - OOH Location Intelligence',
  description: 'Single operating system for OOH media business in India',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/maplibre-gl@5.0.0/dist/maplibre-gl.css" rel="stylesheet" />
      </head>
      <body className="overflow-hidden">
        {children}
      </body>
    </html>
  );
}
