'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiPhone, FiShoppingCart, FiSearch } from 'react-icons/fi';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const path = (usePathname() || '/').replace(/(.)\/$/, '$1');

    const links = [
        { label: 'Inicio', href: '/' },
        { label: 'Tienda', href: '/tienda' },
        { label: 'Servicios', href: '/servicios' },
        { label: 'Solicitar Reparación', href: '/solicitar-reparacion' },
        { label: 'Nosotros', href: '/nosotros' },
        { label: 'Contacto', href: '/contacto' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/tienda?buscar=${encodeURIComponent(searchQuery.trim())}`;
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const iconBtn = 'p-2.5 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-full transition-colors';

    return (
        <nav className="bg-white/85 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-[72px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 min-w-0">
                        <img src="/logo-sm.png" alt="Servimos Norte" className="w-10 h-10 rounded-xl shadow-sm" />
                        <span className="text-lg font-extrabold tracking-tight text-primary-500 whitespace-nowrap">
                            Servimos <span className="text-accent-500">Norte</span>
                        </span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-[15px] font-semibold rounded-full transition-colors ${path === link.href ? 'text-primary-500 bg-gray-100' : 'text-gray-500 hover:text-primary-500'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => setSearchOpen(!searchOpen)} className={iconBtn} aria-label="Buscar">
                            <FiSearch className="text-xl" />
                        </button>
                        <Link href="/tienda" className={iconBtn} aria-label="Tienda">
                            <FiShoppingCart className="text-xl" />
                        </Link>
                        <button onClick={() => setOpen(!open)} className={`lg:hidden ${iconBtn}`} aria-label="Menú">
                            {open ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search bar (expandable) */}
            {searchOpen && (
                <div className="border-t border-gray-100 px-4 py-3 animate-fadeIn">
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar servicios, productos, repuestos..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn-primary btn-sm min-w-0">
                            Buscar
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden border-t border-gray-100 animate-fadeIn">
                    <div className="px-4 py-4 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={`block px-4 py-3 text-base font-semibold rounded-xl transition-colors ${path === link.href ? 'text-primary-500 bg-gray-100' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a href="tel:+573125846294" className="btn-primary btn-sm w-full gap-2 mt-3">
                            <FiPhone /> Llamar ahora
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
