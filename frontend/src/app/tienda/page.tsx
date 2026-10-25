'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import ProductCard, { categoryLabels, getImageUrl, formatCurrency } from '@/components/ProductCard';
import { api } from '@/lib/api';
import { FiShoppingCart, FiSearch, FiCheck, FiInfo, FiShare2, FiArrowLeft, FiX, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TiendaPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState<number>(0);

    useEffect(() => {
        loadProducts();
        // Load cart from localStorage
        const saved = localStorage.getItem('servimos_cart');
        if (saved) setCart(JSON.parse(saved));
        // Back button (incl. phone) closes the product view instead of leaving the store
        const onPop = () => setSelectedProduct(null);
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    const openProduct = (product: any) => {
        setSelectedProduct(product);
        setActiveImage(0);
        window.history.pushState(null, '', `/tienda/?productId=${product.id}`);
    };

    const closeProduct = () => window.history.back();

    useEffect(() => {
        let result = products;
        if (category) result = result.filter((p) => p.category === category);
        if (search) result = result.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
    }, [products, category, search]);

    const loadProducts = async () => {
        try {
            const data = await api.getProducts();
            setProducts(data);
            setFiltered(data);
            
            // Check for product or search (from the navbar) in URL
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                if (params.get('buscar')) setSearch(params.get('buscar')!);
                const productId = params.get('productId');
                if (productId) {
                    const product = data.find((p: any) => String(p.id) === productId);
                    if (product) {
                        // Shared link: put /tienda underneath so "Volver" stays in the store
                        window.history.replaceState(null, '', '/tienda/');
                        openProduct(product);
                    }
                }
            }
        } catch (err) {
            console.error('Error loading products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: any) => {
        const existing = cart.find((item) => item.id === product.id);
        let newCart;
        if (existing) {
            if (existing.quantity >= product.stock) {
                toast.error(`Solo hay ${product.stock} unidades disponibles en stock.`);
                return;
            }
            newCart = cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            if (product.stock < 1) {
                toast.error('Producto agotado.');
                return;
            }
            newCart = [...cart, { ...product, quantity: 1 }];
        }
        setCart(newCart);
        localStorage.setItem('servimos_cart', JSON.stringify(newCart));
        toast.success(`${product.name} agregado al carrito`);
    };

    const handleShare = (product: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const url = `${window.location.origin}/tienda?productId=${product.id}`;
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Mira este producto: ${product.name}`,
                url: url,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Enlace copiado al portapapeles');
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen pb-16">
                <PageHeader
                    title="Nuestra Tienda"
                    subtitle="Repuestos, accesorios y electrodomésticos reacondicionados con garantía"
                    image="/images/headers/header-tienda.png"
                />

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
                    {/* Filters */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 mb-5">
                        <div className="relative lg:w-96">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="input pl-11 pr-10 rounded-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600">
                                    <FiX />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 max-w-none sm:max-w-full">
                            {[['', 'Todos'], ...Object.entries(categoryLabels)].map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setCategory(key)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${category === key ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {!loading && (
                        <p className="text-sm text-gray-500 mb-4">
                            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                            {search && <> para &ldquo;<span className="font-semibold text-primary-500">{search}</span>&rdquo;</>}
                        </p>
                    )}

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-100" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <FiSearch className="text-4xl text-gray-300 mx-auto mb-3" />
                            <p className="text-lg text-gray-500">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                            {filtered.map((product) => (
                                <div key={product.id} className="cursor-pointer" onClick={() => openProduct(product)}>
                                    <ProductCard product={product} detailed>
                                        <div className="mt-3 space-y-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                disabled={product.stock === 0}
                                                className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-full bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                                            >
                                                <FiShoppingCart />
                                                {product.stock > 0 ? <>Agregar<span className="hidden sm:inline">&nbsp;al carrito</span></> : 'Agotado'}
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openProduct(product); }}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:text-accent-700 hover:border-accent-300 transition-colors"
                                                >
                                                    <FiFileText /> Detalles
                                                </button>
                                                <button
                                                    onClick={(e) => handleShare(product, e)}
                                                    className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-accent-600 hover:border-accent-300 transition-colors"
                                                    aria-label="Compartir"
                                                >
                                                    <FiShare2 />
                                                </button>
                                            </div>
                                        </div>
                                    </ProductCard>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Floating Cart (left on phones so it doesn't cover the WhatsApp button) */}
                {cartCount > 0 && (
                    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-start sm:justify-center px-4 pointer-events-none">
                        <Link
                            href="/checkout"
                            className="pointer-events-auto inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-full bg-primary-500 text-white shadow-2xl hover:bg-primary-600 transition-colors animate-fadeInUp"
                        >
                            <span className="relative">
                                <FiShoppingCart className="text-xl" />
                                <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-[11px] font-bold flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </span>
                            <span className="font-semibold text-sm hidden sm:inline">Ver carrito</span>
                            <span className="bg-white/15 px-3 py-1.5 rounded-full text-sm font-bold">{formatCurrency(cartTotal)}</span>
                        </Link>
                    </div>
                )}

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-white z-[100] overflow-y-auto overflow-x-hidden overscroll-contain">
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
                            <div className="max-w-5xl mx-auto px-4 py-3">
                                <button onClick={closeProduct} className="flex items-center gap-2 text-gray-600 hover:text-primary-500 font-medium">
                                    <FiArrowLeft size={20} /> Volver a la tienda
                                </button>
                            </div>
                        </div>
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {/* Left: Images Gallery */}
                                <div className="bg-gray-50 p-6 md:p-8 flex flex-col items-center">
                                    <div className="aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 relative">
                                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                            <img
                                                src={getImageUrl(selectedProduct.images[activeImage])}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <FiInfo className="text-6xl text-gray-300" />
                                        )}
                                        {selectedProduct.stock === 0 && (
                                            <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                                                Agotado
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnails */}
                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto w-full max-w-sm pb-2 slider-scrollbar">
                                            {selectedProduct.images.map((img: string, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveImage(i)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-accent-500 opacity-100 ring-2 ring-accent-200' : 'border-transparent opacity-60 hover:opacity-100 bg-white'}`}
                                                >
                                                    <img src={getImageUrl(img)} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Details */}
                                <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                                    <div>
                                        <div className="mb-4">
                                            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg ${
                                                selectedProduct.category === 'NEW' ? 'bg-green-100 text-green-700' :
                                                selectedProduct.category === 'REFURBISHED' ? 'bg-blue-100 text-blue-700' :
                                                selectedProduct.category === 'SPARE_PART' ? 'bg-gray-100 text-gray-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {categoryLabels[selectedProduct.category]}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl font-extrabold text-primary-500 mb-2 leading-tight break-words">
                                            {selectedProduct.name}
                                        </h2>
                                        
                                        <div className="mb-6">
                                            <p className="text-3xl font-extrabold text-primary-500">
                                                {formatCurrency(Number(selectedProduct.price))}
                                                <span className="text-sm font-medium text-gray-400 ml-2">COP</span>
                                            </p>
                                        </div>

                                        <div className="prose prose-sm text-gray-600 mb-8 w-full max-w-none">
                                            <p className="whitespace-pre-line break-words">{selectedProduct.description}</p>
                                        </div>

                                        {/* Specifications List */}
                                        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {selectedProduct.brand && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Marca</span>
                                                    <span className="text-gray-800 font-medium">{selectedProduct.brand}</span>
                                                </div>
                                            )}
                                            {selectedProduct.applianceType && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Equipo</span>
                                                    <span className="text-gray-800 font-medium">{selectedProduct.applianceType}</span>
                                                </div>
                                            )}
                                            {selectedProduct.warrantyInfo && (
                                                <div className="flex flex-col col-span-2">
                                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Garantía</span>
                                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                                        <FiCheck /> {selectedProduct.warrantyInfo}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-col col-span-2 sm:col-span-1">
                                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Disponibilidad</span>
                                                <span className={`${selectedProduct.stock > 10 ? 'text-green-600' : selectedProduct.stock > 0 ? 'text-orange-500' : 'text-red-500'} font-medium`}>
                                                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto pt-6 border-t border-gray-100 flex gap-3">
                                        <button
                                            onClick={(e) => handleShare(selectedProduct, e)}
                                            className="btn btn-lg px-6 flex justify-center items-center shadow-sm hover:shadow-md transition-all border-2 border-gray-200 text-gray-600 hover:bg-accent-500 hover:text-white hover:border-accent-500"
                                            title="Compartir"
                                        >
                                            <FiShare2 className="text-xl" />
                                        </button>
                                        <button
                                            onClick={() => { addToCart(selectedProduct); closeProduct(); }}
                                            disabled={selectedProduct.stock === 0}
                                            className="btn-primary flex-1 btn-lg text-lg flex justify-center items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                                        >
                                            <FiShoppingCart className="text-xl" />
                                            {selectedProduct.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
