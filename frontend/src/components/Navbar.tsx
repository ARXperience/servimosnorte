'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiPhone, FiShoppingCart, FiSearch } from 'react-icons/fi';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Servimos Norte" className="w-12 h-12 rounded-xl" />
                        <div className="hidden sm:block">
                            <span className="text-xl font-bold text-primary-500">Servimos</span>
                            <span className="text-xl font-bold text-accent-500"> Norte</span>
                        </div>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 text-base font-medium text-gray-600 hover:text-accent-500 
                           rounded-lg hover:bg-accent-50 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search toggle */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-3 text-gray-600 hover:text-accent-500 hover:bg-accent-50 rounded-xl transition-all"
                            aria-label="Buscar"
                        >
                            <FiSearch className="text-xl" />
                        </button>
                        {/* Desktop Llamar button removed */}
                        <Link
                            href="/tienda"
                            className="p-3 text-gray-600 hover:text-accent-500 hover:bg-accent-50 rounded-xl transition-all"
                        >
                            <FiShoppingCart className="text-xl" />
                        </Link>
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden p-3 text-gray-600 hover:bg-gray-100 rounded-xl"
                            aria-label="Menú"
                        >
                            {open ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search bar (expandable) */}
            {searchOpen && (
                <div className="bg-white border-t px-4 py-3 animate-fadeIn">
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar servicios, productos, repuestos..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                                text-base focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent
                                transition-all"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl 
                            hover:bg-accent-600 transition-colors"
                        >
                            Buscar
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden bg-white border-t animate-fadeIn">
                    <div className="px-4 py-4 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-3.5 text-lg font-medium text-gray-600 hover:text-accent-500 
                           rounded-xl hover:bg-accent-50 transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="tel:+573125846294"
                            className="flex items-center gap-2 px-4 py-3.5 text-lg font-medium text-accent-600 
                         bg-accent-50 rounded-xl mt-2"
                        >
                            <FiPhone />
                            Llamar ahora
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
