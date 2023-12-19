import Header from '@/components/Header';
import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Openai UI',
  description: 'UI fo ai application using supabase and vercel ai sdk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
         <Header />
         {children}
      </body>
    </html>
  );
}
