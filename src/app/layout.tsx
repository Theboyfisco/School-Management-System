import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Academia Connect — School Management System',
  description: 'A modern, intelligent school management platform for administrators, teachers, students, and parents.',
  keywords: ['school management', 'education', 'academia', 'dashboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${dmSans.variable} font-sans bg-surface-50 dark:bg-surface-900`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          theme="colored"
          toastClassName="!rounded-xl !shadow-glass !font-sans"
        />
      </body>
    </html>
  );
}
