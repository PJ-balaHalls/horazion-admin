import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Horizion Backoffice | Sirius',
  description: 'Sistema de gestão do ecossistema Horazion Life',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} bg-horazion-light text-horazion-gray font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}