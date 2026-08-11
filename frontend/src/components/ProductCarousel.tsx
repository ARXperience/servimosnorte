'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from 'react-icons/fi';

const categoryLabels: Record<string, string> = {
    NEW: 'Nuevos',
    REFURBISHED: 'Reacondicionados',
    SPARE_PART: 'Repuestos',
    ACCESSORY: 'Accesorios',
};

const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api').replace(/\/api\/?$/, '');
    return `${baseUrl}${img.startsWith('/') ? img : `/${img}`}`;
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

export default function ProductCarousel() {
    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const track = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getProducts()
            .then((data: any) => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const scroll = (dir: number) =>
        track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });

    const visible = category ? products.filter((p) => p.category === category) : products;
    const categories = Object.keys(categoryLabels).filter((k) => products.some((p) => p.category === k));

    if (loading || products.length === 0) return null;

    return (
        <section className="section">
            <div className="text-center mb-8">
                <h2 className="page-title">Productos de Nuestra Tienda</h2>
                <p className="text-body-lg text-gray-500 max-w-2xl mx-auto">
                    Repuestos, accesorios y electrodomésticos reacondicionados con garantía
                </p>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
                <button
                    onClick={() => setCategory('')}
                    className={`btn-sm rounded-xl font-semibold px-6 ${!category ? 'bg-accent-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-accent-300'}`}
                >
                    Todos
                </button>
                {categories.map((key) => (
                    <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`btn-sm rounded-xl font-semibold px-6 ${category === key ? 'bg-accent-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-accent-300'}`}
                    >
                        {categoryLabels[key]}
                    </button>
                ))}
            </div>

            <div className="relative">
                <button
                    onClick={() => scroll(-1)}
                    aria-label="Anterior"
                    className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-primary-500 hover:bg-accent-500 hover:text-white transition-colors"
                >
                    <FiChevronLeft className="text-2xl" />
                </button>

                <div
                    ref={track}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 slider-scrollbar"
                >
                    {visible.map((product) => (
                        <Link
                            key={product.id}
                            href={`/tienda?productId=${product.id}`}
                            className="card group overflow-hidden snap-start flex-shrink-0 w-64 sm:w-72"
                        >
                            <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden -mx-6 -mt-6">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={getImageUrl(product.images[0])}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="text-6xl">
                                        {product.category === 'NEW' ? '🆕' :
                                            product.category === 'REFURBISHED' ? '🔄' :
                                                product.category === 'SPARE_PART' ? '⚙️' : '🔌'}
                                    </div>
                                )}
                            </div>
                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${product.category === 'NEW' ? 'bg-green-100 text-green-700' :
                                product.category === 'REFURBISHED' ? 'bg-blue-100 text-blue-700' :
                                    product.category === 'SPARE_PART' ? 'bg-gray-100 text-gray-700' :
                                        'bg-purple-100 text-purple-700'
                                }`}>
                                {categoryLabels[product.category]}
                            </span>
                            <h3 className="font-bold text-lg text-primary-500 line-clamp-2 mt-2">{product.name}</h3>
                            <div className="flex items-center justify-between pt-3">
                                <p className="text-xl font-extrabold text-accent-500">{formatCurrency(Number(product.price))}</p>
                                <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.stock > 0 ? 'Disponible' : 'Agotado'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <button
                    onClick={() => scroll(1)}
                    aria-label="Siguiente"
                    className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-primary-500 hover:bg-accent-500 hover:text-white transition-colors"
                >
                    <FiChevronRight className="text-2xl" />
                </button>
            </div>

            <div className="text-center mt-8">
                <Link href="/tienda" className="btn-primary btn-lg">
                    <FiShoppingBag className="mr-2" /> Ver toda la tienda
                </Link>
            </div>
        </section>
    );
}
