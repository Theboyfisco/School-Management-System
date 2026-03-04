'use client';

import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const ToastContainer = dynamic(
  () => import('react-toastify').then((c) => c.ToastContainer),
  { ssr: false }
);

export default function ToastProvider() {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
} 