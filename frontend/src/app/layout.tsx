import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

import WhatsAppFloat from '@/components/WhatsAppFloat';
import VisitTracker from '@/components/VisitTracker';

export const metadata: Metadata = {
    title: 'Servimos Norte | Reparación de Electrodomésticos en Bogotá',
    description: 'Servicio profesional de reparación de electrodomésticos, venta de repuestos y equipos reacondicionados en Bogotá, Colombia. Más de 30 años de experiencia.',
    keywords: 'reparación electrodomésticos, Bogotá, licuadoras, aspiradoras, microondas, repuestos, servicio técnico',
    openGraph: {
        title: 'Servimos Norte | Reparación de Electrodomésticos',
        description: 'Servicio profesional de reparación de electrodomésticos en Bogotá',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
            </head>
            <body className="min-h-screen flex flex-col overflow-x-hidden">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: { fontSize: '0.875rem', padding: '0.75rem', borderRadius: '0.75rem', maxWidth: '90vw' },
                    }}
                />
                {children}
                <WhatsAppFloat />
                <VisitTracker />
            </body>
        </html>
    );
}
