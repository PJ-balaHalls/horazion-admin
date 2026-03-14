import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Horazion Admin',
  description: 'Sistema Operativo Social',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // AS TAGS HTML E BODY SÃO OBRIGATÓRIAS AQUI
    <html lang="pt-BR" className={`${inter.variable} font-sans`}>
      <body className="bg-white text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}