
import type {Metadata} from 'next';
import './globals.css';
import { LocalDataProvider } from '@/components/local-data-provider';
import { LanguageProvider } from '@/lib/i18n-context';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'NutriNexus - Smart Nutrition Tracking',
  description: 'Track your fitness and nutrition with AI-powered scanning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseClientProvider>
          <AuthProvider>
            <LanguageProvider>
              <LocalDataProvider>
                {children}
                <Toaster />
              </LocalDataProvider>
            </LanguageProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
