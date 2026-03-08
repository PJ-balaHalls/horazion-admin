import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Usamos apenas Inter, conforme diretriz do Horizion Codex
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Horazion Admin | Central de Controle',
  description: 'Sistema Operativo Social (SOS) - Painel Administrativo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      {/* Fundo Branco Puro conforme Horizon Clarity */}
      <body className="bg-white text-black font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}