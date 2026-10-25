'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard, { categoryLabels } from '@/components/ProductCard';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';

// Home showcase: in-stock items with photos first, then new > refurbished > accessories > spare parts, priciest first.
const categoryRank: Record<string, number> = { NEW: 0, REFURBISHED: 1, ACCESSORY: 2, SPARE_PART: 3 };
const showcaseOrder = (a: any, b: any) =>
    Number(b.stock > 0) - Number(a.stock > 0) ||
    Number(b.images?.length > 0) - Number(a.images?.length > 0) ||
    (categoryRank[a.category] ?? 9) - (categoryRank[b.category] ?? 9) ||
    Number(b.price) - Number(a.price);

export default function ProductCarousel() {
    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const track = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getProducts()
            .then((data: any) => setProducts(Array.isArray(data) ? [...data].sort(showcaseOrder) : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const scroll = (dir: number) =>
        track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });

    const visible = category ? products.filter((p) => p.category === category) : products;
    const categories = Object.keys(categoryLabels).filter((k) => products.some((p) => p.category === k));

    if (loading || products.length === 0) return null;

    const arrow = 'hidden sm:flex w-11 h-11 items-center justify-center rounded-full bg-white border border-gray-200 text-primary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors';

    return (
        <section className="section">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                    <p className="eyebrow">Tienda</p>
                    <h2 className="page-title">Productos de Nuestra Tienda</h2>
                    <p className="text-gray-500">Repuestos, accesorios y electrodomésticos reacondicionados con garantía</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/tienda" className="inline-flex items-center gap-2 font-semibold text-accent-600 hover:text-accent-700 mr-2">
                        Ver toda la tienda <FiArrowRight />
                    </Link>
                    <button onClick={() => scroll(-1)} aria-label="Anterior" className={arrow}>
                        <FiChevronLeft className="text-xl" />
                    </button>
                    <button onClick={() => scroll(1)} aria-label="Siguiente" className={arrow}>
                        <FiChevronRight className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-none sm:max-w-full">
                {[['', 'Todos'], ...categories.map((k) => [k, categoryLabels[k]])].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${category === key ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div ref={track} className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-px-4 sm:scroll-px-0 pt-1 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-none sm:max-w-full no-scrollbar">
                {visible.map((product) => (
                    <Link key={product.id} href={`/tienda?productId=${product.id}`} className="snap-start flex-shrink-0 w-[46%] sm:w-60 lg:w-64">
                        <ProductCard product={product} />
                    </Link>
                ))}
            </div>
        </section>
    );
}
