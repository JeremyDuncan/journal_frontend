"use client";

import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/PotectedRoute';
const publicPaths = ['/login'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPath = publicPaths.includes(pathname);

    return (
        <SessionProvider>
            <Header />
            {isPublicPath ? (
                <main className="flex-grow">{children}</main>
            ) : (
                <ProtectedRoute>
                    <main className="flex-grow">{children}</main>
                </ProtectedRoute>
            )}
            <Footer />
        </SessionProvider>
    );
}
