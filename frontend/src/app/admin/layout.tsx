'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    FiHome, FiUsers, FiTool, FiPackage, FiShoppingBag,
    FiDollarSign, FiBarChart2, FiLogOut, FiMenu, FiX, FiMessageSquare, FiTrash2
} from 'react-icons/fi';

const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { href: '/admin/clientes', label: 'Clientes', icon: <FiUsers /> },
    { href: '/admin/reparaciones', label: 'Reparaciones', icon: <FiTool /> },
    { href: '/admin/productos', label: 'Productos', icon: <FiPackage /> },
    { href: '/admin/pedidos', label: 'Pedidos', icon: <FiShoppingBag /> },
    { href: '/admin/pagos', label: 'Pagos', icon: <FiDollarSign /> },
    { href: '/admin/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
    { href: '/admin/chatbot', label: 'Bot WhatsApp', icon: <FiMessageSquare /> },
    { href: '/admin/usuarios', label: 'Usuarios', icon: <FiUsers /> },
    { href: '/admin/papelera', label: 'Papelera', icon: <FiTrash2 /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('servimos_user');
        const token = localStorage.getItem('servimos_token');
        if (!saved || !token) {
            if (!pathname.includes('/login')) router.push('/admin/login');
            return;
        }
        setUser(JSON.parse(saved));
    }, [pathname]);

    if (pathname.includes('/login')) return <>{children}</>;

    const handleLogout = () => {
        localStorage.removeItem('servimos_token');
        localStorage.removeItem('servimos_user');
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 
                          z-50 transform transition-transform duration-300 flex flex-col
                          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Brand */}
                <div className="p-6 border-b">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Servimos Norte" className="w-10 h-10 rounded-lg" />
                        <div>
                            <p className="font-bold text-primary-500">Servimos Norte</p>
                            <p className="text-xs text-gray-400">Panel Admin</p>
                        </div>
                    </Link>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User */}
                <div className="p-4 border-t">
                    {user && (
                        <div className="flex items-center gap-3 mb-3 px-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="font-bold text-primary-500 text-sm">{user.name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.role}</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="sidebar-link text-red-500 hover:bg-red-50 w-full">
                        <FiLogOut className="text-xl" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-h-screen flex flex-col">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <FiMenu className="text-2xl" />
                    </button>
                    <h1 className="text-lg font-bold text-primary-500">
                        {menuItems.find((m) => m.href === pathname)?.label || 'Admin'}
                    </h1>
                    <div className="ml-auto">
                        <Link href="/" className="text-sm text-gray-400 hover:text-accent-500 transition-colors">
                            ← Volver al sitio
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
