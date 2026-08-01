'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api';
const categoryLabels: Record<string, string> = {
    NEW: 'Nuevo', REFURBISHED: 'Reacondicionado', SPARE_PART: 'Repuesto', ACCESSORY: 'Accesorio',
};

export default function ProductosPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({
        name: '', description: '', price: 0, stock: 0, category: 'SPARE_PART',
        warrantyInfo: '', brand: '', applianceType: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try { setProducts(await api.getProducts()); } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: 0, stock: 0, category: 'SPARE_PART', warrantyInfo: '', brand: '', applianceType: '' });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setExistingImages([]);
        setShowModal(true);
    };

    const openEdit = (p: any) => {
        setEditing(p);
        setForm({
            name: p.name, description: p.description, price: p.price, stock: p.stock,
            category: p.category, warrantyInfo: p.warrantyInfo || '', brand: p.brand || '', applianceType: p.applianceType || ''
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setExistingImages(p.images || []);
        setShowModal(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedFiles.length + existingImages.length > 5) {
            toast.error('Máximo 5 imágenes por producto');
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
        const urls = files.map(f => URL.createObjectURL(f));
        setPreviewUrls(prev => [...prev, ...urls]);
    };

    const removeNewImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = { ...form, price: Number(form.price), stock: Number(form.stock), images: existingImages };
            let product: any;
            if (editing) {
                product = await api.updateProduct(editing.id, data);
                toast.success('Producto actualizado');
            } else {
                product = await api.createProduct(data);
                toast.success('Producto creado');
            }

            // Upload new images if any
            if (selectedFiles.length > 0 && product?.id) {
                setUploading(true);
                try {
                    await api.uploadProductImages(product.id, selectedFiles);
                    toast.success(`${selectedFiles.length} imagen(es) subida(s)`);
                } catch (err: any) {
                    toast.error('Error subiendo imágenes: ' + err.message);
                }
                setUploading(false);
            }

            setShowModal(false);
            loadProducts();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try { await api.deleteProduct(id); toast.success('Eliminado'); loadProducts(); }
        catch (err: any) { toast.error(err.message); }
    };

    const formatCurrency = (a: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(a);

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

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h2 className="text-heading text-primary-500">Productos</h2>
                    <p className="text-gray-500">Inventario ({products.length})</p>
                </div>
                <button onClick={openCreate} className="btn-primary btn-sm"><FiPlus className="mr-2" /> Nuevo Producto</button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="card overflow-hidden">
                            {/* Product Image */}
                            <div className="h-48 bg-gray-100 -mx-6 -mt-6 mb-4 flex items-center justify-center overflow-hidden">
                                {p.images && p.images.length > 0 ? (
                                    <img src={getImageUrl(p.images[0])} alt={p.name}
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-300">
                                        <FiImage className="text-5xl mx-auto mb-2" />
                                        <p className="text-sm">Sin imagen</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <span className="badge bg-gray-100 text-gray-700 text-xs">{categoryLabels[p.category]}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit /></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>

                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-accent-500">{formatCurrency(Number(p.price))}</span>
                                <span className={`text-sm font-bold ${p.stock > 5 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    Stock: {p.stock}
                                </span>
                            </div>

                            {/* Image thumbnails */}
                            {p.images && p.images.length > 1 && (
                                <div className="flex gap-1 mt-3 pt-3 border-t">
                                    {p.images.slice(0, 4).map((img: string, i: number) => (
                                        <img key={i} src={getImageUrl(img)} alt=""
                                            className="w-12 h-12 object-cover rounded-lg border" />
                                    ))}
                                    {p.images.length > 4 && (
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                            +{p.images.length - 4}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-400">
                            <FiImage className="text-6xl mx-auto mb-4" />
                            <p className="text-lg">No hay productos</p>
                            <p className="text-sm">Agrega tu primer producto con imágenes</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl animate-fadeInUp max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">{editing ? 'Editar' : 'Nuevo'} Producto</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label">Nombre *</label>
                                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Descripción *</label>
                                <textarea className="input" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Precio (COP) *</label>
                                    <input className="input" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="label">Stock *</label>
                                    <input className="input" type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Categoría *</label>
                                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <option value="NEW">Nuevo</option>
                                    <option value="SPARE_PART">Repuesto</option>
                                    <option value="REFURBISHED">Reacondicionado</option>
                                    <option value="ACCESSORY">Accesorio</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Garantía</label>
                                <input className="input" value={form.warrantyInfo} onChange={(e) => setForm({ ...form, warrantyInfo: e.target.value })} placeholder="6 meses" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Marca</label>
                                    <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Tipo de equipo</label>
                                    <input className="input" value={form.applianceType} onChange={(e) => setForm({ ...form, applianceType: e.target.value })} />
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className="label text-lg flex items-center gap-2">
                                    <FiImage /> Imágenes del producto (máx. 5)
                                </label>

                                {/* Existing images */}
                                {existingImages.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {existingImages.map((img, i) => (
                                            <div key={i} className="relative group">
                                                <img src={getImageUrl(img)} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200" />
                                                <button type="button" onClick={() => removeExistingImage(i)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New image previews */}
                                {previewUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {previewUrls.map((url, i) => (
                                            <div key={i} className="relative group">
                                                <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-accent-200" />
                                                <span className="absolute top-1 left-1 bg-accent-500 text-white text-xs px-1 rounded">Nueva</span>
                                                <button type="button" onClick={() => removeNewImage(i)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                {existingImages.length + selectedFiles.length < 5 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-accent-500 hover:bg-accent-50 transition-all"
                                    >
                                        <FiUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 font-medium">Haz clic para subir imágenes</p>
                                        <p className="text-gray-400 text-sm">JPG, PNG, WEBP (máx. 5MB cada una)</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" multiple accept="image/*"
                                    className="hidden" onChange={handleFileSelect} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1" disabled={uploading}>
                                    {uploading ? 'Subiendo imágenes...' : 'Guardar'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
