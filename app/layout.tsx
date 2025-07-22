import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-blue-900">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}