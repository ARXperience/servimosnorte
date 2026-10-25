import { FiPackage } from 'react-icons/fi';

export const categoryLabels: Record<string, string> = {
    NEW: 'Nuevos',
    REFURBISHED: 'Reacondicionados',
    SPARE_PART: 'Repuestos',
    ACCESSORY: 'Accesorios',
};

const categoryDots: Record<string, string> = {
    NEW: 'bg-accent-500',
    REFURBISHED: 'bg-blue-500',
    SPARE_PART: 'bg-gray-400',
    ACCESSORY: 'bg-purple-500',
};

export const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api').replace(/\/api\/?$/, '');
    return `${baseUrl}${img.startsWith('/') ? img : `/${img}`}`;
};

export const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

// Shared product tile for the store grid and the home carousel; `detailed` adds the store's extra info, `children` holds the card's actions.
export default function ProductCard({ product, detailed, children }: { product: any; detailed?: boolean; children?: React.ReactNode }) {
    return (
        <div className="group h-full flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {product.images?.length > 0 ? (
                    <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="text-5xl text-gray-300" />
                    </div>
                )}
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-primary-500 shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${categoryDots[product.category] || 'bg-gray-400'}`} />
                    {categoryLabels[product.category]}
                </span>
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Agotado</span>
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col p-3 sm:p-4">
                {product.brand && (
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1 truncate">{product.brand}</p>
                )}
                <h3 className="text-sm sm:text-base font-semibold text-primary-500 leading-snug line-clamp-2">{product.name}</h3>
                {detailed && <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>}
                {detailed && product.warrantyInfo && (
                    <p className="text-xs sm:text-sm text-accent-700 font-medium mt-1">✓ {product.warrantyInfo}</p>
                )}
                <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                    <p className="text-base sm:text-lg font-extrabold text-primary-500">{formatCurrency(Number(product.price))}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${product.stock > 0 ? 'text-accent-700' : 'text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-accent-500' : 'bg-red-500'}`} />
                        {product.stock > 0 ? (detailed ? `${product.stock} en stock` : 'Disponible') : 'Agotado'}
                    </span>
                </div>
                {children}
            </div>
        </div>
    );
}
