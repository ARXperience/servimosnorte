'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { FiShoppingCart, FiSearch, FiFilter, FiX, FiCheck, FiInfo, FiShare2, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

const categoryLabels: Record<string, string> = {
    NEW: 'Nuevos',
    REFURBISHED: 'Reacondicionados',
    SPARE_PART: 'Repuestos',
    ACCESSORY: 'Accesorios',
};

const getApiBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api';
    return url.replace(/\/api\/?$/, '');
};

const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const baseUrl = getApiBaseUrl();
    const imgPath = img.startsWith('/') ? img : `/${img}`;
    return `${baseUrl}${imgPath}`;
};

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
    }, []);

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
            
            // Check for product in URL
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const productId = params.get('productId');
                if (productId) {
                    const product = data.find((p: any) => String(p.id) === productId);
                    if (product) {
                        setSelectedProduct(product);
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

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen">
                <section className="relative bg-primary-500 text-white py-16 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/headers/header-tienda.png')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/70 to-primary-500/50"></div>
                    <div className="absolute right-0 sm:right-20 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                        <img src="/logo.png" alt="Servimos Norte" className="w-64 sm:w-96 object-contain" />
                    </div>
                    <div className="section py-0 relative z-10">
                        <h1 className="text-2xl sm:text-heading-xl text-white mb-4 animate-fadeInUp break-words">Nuestra Tienda</h1>
                        <p className="text-base sm:text-xl text-gray-200 max-w-3xl animate-fadeInUp delay-100">
                            Repuestos, accesorios y electrodomésticos reacondicionados con garantía
                        </p>
                    </div>
                </section>

                <section className="section">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fadeInUp">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="input pl-12"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setCategory('')}
                                className={`btn-sm rounded-xl font-semibold px-6 ${!category ? 'bg-accent-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-accent-300'
                                    }`}
                            >
                                Todos
                            </button>
                            {Object.entries(categoryLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setCategory(key)}
                                    className={`btn-sm rounded-xl font-semibold px-6 ${category === key ? 'bg-accent-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-accent-300'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-xl text-gray-500">Cargando productos...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-500">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((product) => (
                                <div key={product.id} className="card group overflow-hidden animate-fadeInUp">
                                    <div 
                                        className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden -mx-6 -mt-6 cursor-pointer"
                                        onClick={() => { setSelectedProduct(product); setActiveImage(0); }}
                                    >
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
                                    <div className="space-y-2 cursor-pointer" onClick={() => { setSelectedProduct(product); setActiveImage(0); }}>
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${product.category === 'NEW' ? 'bg-green-100 text-green-700' :
                                            product.category === 'REFURBISHED' ? 'bg-blue-100 text-blue-700' :
                                            product.category === 'SPARE_PART' ? 'bg-gray-100 text-gray-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                            {categoryLabels[product.category]}
                                        </span>
                                        <h3 className="font-bold text-lg text-primary-500 line-clamp-2">{product.name}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                                        {product.warrantyInfo && (
                                            <p className="text-green-600 text-sm font-medium">✓ {product.warrantyInfo}</p>
                                        )}
                                        <div className="flex items-center justify-between pt-3 pb-3 border-b border-gray-100 mb-3">
                                            <p className="text-2xl font-extrabold text-accent-500">
                                                {formatCurrency(Number(product.price))}
                                            </p>
                                            <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                disabled={product.stock === 0}
                                                className="btn-primary w-full py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
                                                title="Agregar"
                                            >
                                                <FiShoppingCart className="text-xl" />
                                                <span className="font-semibold">{product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}</span>
                                            </button>
                                            <div className="flex items-stretch w-full bg-green-50/50 border border-green-200/60 rounded-xl overflow-hidden hover:border-green-300 transition-colors">
                                                <button
                                                    onClick={() => { setSelectedProduct(product); setActiveImage(0); }}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-green-700 hover:bg-green-100/50 transition-colors font-medium text-sm"
                                                >
                                                    <FiFileText className="text-lg" />
                                                    Detalles
                                                </button>
                                                <div className="w-[1px] bg-green-200/60 my-2"></div>
                                                <button
                                                    onClick={(e) => handleShare(product, e)}
                                                    className="flex items-center justify-center px-5 py-2 text-green-700 hover:bg-green-100/50 transition-colors"
                                                    title="Compartir"
                                                >
                                                    <FiShare2 className="text-lg" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Floating Cart */}
                {cartCount > 0 && (
                    <div className="fixed bottom-6 right-6 z-50 animate-fadeInUp">
                        <Link
                            href="/checkout"
                            className="btn-primary btn-lg shadow-2xl animate-pulse-glow flex items-center gap-3"
                        >
                            <FiShoppingCart className="text-2xl" />
                            <span className="font-bold">{cartCount} artículo{cartCount > 1 ? 's' : ''}</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full">{formatCurrency(cartTotal)}</span>
                        </Link>
                    </div>
                )}

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 sm:p-6 fade-in" onClick={() => setSelectedProduct(null)}>
                        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
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
                                        <div className="flex gap-2 overflow-x-auto max-w-sm pb-2 slider-scrollbar">
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
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg ${
                                                selectedProduct.category === 'NEW' ? 'bg-green-100 text-green-700' :
                                                selectedProduct.category === 'REFURBISHED' ? 'bg-blue-100 text-blue-700' :
                                                selectedProduct.category === 'SPARE_PART' ? 'bg-gray-100 text-gray-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {categoryLabels[selectedProduct.category]}
                                            </span>
                                            <button 
                                                onClick={() => setSelectedProduct(null)}
                                                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                <FiX size={20} />
                                            </button>
                                        </div>

                                        <h2 className="text-3xl font-extrabold text-primary-500 mb-2 leading-tight">
                                            {selectedProduct.name}
                                        </h2>
                                        
                                        <div className="mb-6">
                                            <p className="text-3xl font-extrabold text-accent-500">
                                                {formatCurrency(Number(selectedProduct.price))}
                                                <span className="text-sm font-medium text-gray-400 ml-2">COP</span>
                                            </p>
                                        </div>

                                        <div className="prose prose-sm text-gray-600 mb-8 w-full max-w-none">
                                            <p>{selectedProduct.description}</p>
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
                                            onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
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
