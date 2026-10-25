import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paperwise — Your PDFs, understood',
  description: 'Turn long PDFs into clear, useful summaries with AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
