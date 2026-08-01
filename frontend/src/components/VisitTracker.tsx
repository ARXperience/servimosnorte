'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api';
const SESSION_KEY = 'sn_session_id';
const HEARTBEAT_MS = 15000;

async function post(endpoint: string, data: any, keepalive = false): Promise<any> {
    try {
        const res = await fetch(`${API_URL}/accounting/visit${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive,
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export default function VisitTracker() {
    const pathname = usePathname();
    const sessionIdRef = useRef<string | null>(null);
    const pageViewIdRef = useRef<string | null>(null);
    const pageStartRef = useRef<number>(Date.now());
    const busyRef = useRef<Promise<void> | null>(null);

    const secondsOnPage = () => Math.round((Date.now() - pageStartRef.current) / 1000);

    const sendHeartbeat = (keepalive = false) => {
        if (!sessionIdRef.current) return;
        post('/heartbeat', {
            sessionId: sessionIdRef.current,
            pageViewId: pageViewIdRef.current || undefined,
            seconds: secondsOnPage(),
        }, keepalive);
    };

    const startSession = async (path: string) => {
        const result = await post('/session', {
            path,
            referrer: document.referrer || undefined,
            language: navigator.language || undefined,
            screen: `${window.screen.width}x${window.screen.height}`,
            tzOffset: new Date().getTimezoneOffset(),
        });
        if (result?.sessionId) {
            sessionIdRef.current = result.sessionId;
            pageViewIdRef.current = result.pageViewId || null;
            sessionStorage.setItem(SESSION_KEY, result.sessionId);
        }
    };

    const trackPage = async (path: string) => {
        // Cerrar el tiempo de la página anterior antes de abrir la nueva
        if (sessionIdRef.current && pageViewIdRef.current) {
            sendHeartbeat();
        }
        pageStartRef.current = Date.now();
        pageViewIdRef.current = null;

        if (!sessionIdRef.current) {
            const stored = sessionStorage.getItem(SESSION_KEY);
            if (stored) sessionIdRef.current = stored;
        }

        if (!sessionIdRef.current) {
            await startSession(path);
            return;
        }

        const result = await post('/pageview', { sessionId: sessionIdRef.current, path });
        if (result?.ok && result.pageViewId) {
            pageViewIdRef.current = result.pageViewId;
        } else {
            // La sesión ya no existe en el servidor: crear una nueva
            sessionStorage.removeItem(SESSION_KEY);
            sessionIdRef.current = null;
            await startSession(path);
        }
    };

    // Registrar cada cambio de página (no se rastrea el panel de administración)
    useEffect(() => {
        if (!pathname || pathname.startsWith('/admin')) return;
        const run = async () => {
            await (busyRef.current || Promise.resolve());
            busyRef.current = trackPage(pathname);
            await busyRef.current;
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Latido periódico + registro de salida
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') sendHeartbeat();
        }, HEARTBEAT_MS);

        const onLeave = () => sendHeartbeat(true);
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') sendHeartbeat(true);
        };
        window.addEventListener('pagehide', onLeave);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            clearInterval(interval);
            window.removeEventListener('pagehide', onLeave);
            document.removeEventListener('visibilitychange', onVisibility);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
