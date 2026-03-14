import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Carrega a fonte Inter nativamente pelo Next.js
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Horazion Admin',
  description: 'Sistema Operativo Social',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // A classe font-sans agora herdará a Inter devido à configuração do Tailwind
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="bg-white text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}