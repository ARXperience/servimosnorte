'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiRefreshCcw, FiTrash2, FiUser, FiTool, FiBox, FiShoppingCart, FiMessageSquare } from 'react-icons/fi';

export default function PapeleraPage() {
    const [trash, setTrash] = useState<any>({ customers: [], repairs: [], products: [], orders: [], users: [], conversations: [] });
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState<string | null>(null);

    useEffect(() => {
        loadTrash();
    }, []);

    const loadTrash = async () => {
        try {
            const data = await api.getTrash();
            setTrash(data);
        } catch (err: any) {
            toast.error(err.message || 'Error al cargar la papelera');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (entity: string, id: string) => {
        setRestoring(id);
        try {
            await api.restoreTrash(entity, id);
            toast.success('Elemento restaurado correctamente');
            loadTrash();
        } catch (err: any) {
            toast.error(err.message || 'Error al restaurar');
        } finally {
            setRestoring(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando papelera...</div>;

    const renderList = (title: string, icon: any, items: any[], entityName: string, formatName: (item: any) => string) => {
        if (items.length === 0) return null;
        return (
            <div className="card p-6 mb-6 animate-fadeInUp">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    {icon} {title}
                </h2>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <p className="font-bold text-gray-800">{formatName(item)}</p>
                                <p className="text-sm text-gray-500">Eliminado el: {new Date(item.deletedAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => handleRestore(entityName, item.id)}
                                disabled={restoring === item.id}
                                className="btn flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200"
                            >
                                <FiRefreshCcw className={restoring === item.id ? 'animate-spin' : ''} />
                                {restoring === item.id ? 'Restaurando...' : 'Restaurar'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const isEmpty = Object.values(trash).every((arr: any) => arr.length === 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FiTrash2 className="text-red-500" /> Papelera de Reciclaje
                    </h1>
                    <p className="text-gray-500 text-sm">Elementos eliminados recientemente que pueden ser restaurados.</p>
                </div>
            </div>

            {isEmpty ? (
                <div className="card p-12 text-center">
                    <FiTrash2 className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">La papelera está vacía.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {renderList('Clientes Eliminados', <FiUser className="text-blue-500"/>, trash.customers, 'customers', (c) => `${c.fullName} (${c.phone})`)}
                    {renderList('Reparaciones Eliminadas', <FiTool className="text-orange-500"/>, trash.repairs, 'repairs', (r) => `${r.applianceType} ${r.brand} - Token: ${r.publicToken}`)}
                    {renderList('Conversaciones (Bot)', <FiMessageSquare className="text-blue-400"/>, trash.conversations, 'conversations', (c) => `Chat con ${c.customerName || c.phone} (${c.phone})`)}
                    {renderList('Productos Eliminados', <FiBox className="text-purple-500"/>, trash.products, 'products', (p) => `${p.name} - $${p.price}`)}
                    {renderList('Pedidos Eliminados', <FiShoppingCart className="text-green-500"/>, trash.orders, 'orders', (o) => `Pedido ${o.id} - ${o.status}`)}
                    {renderList('Usuarios (Admins) Eliminados', <FiUser className="text-red-500"/>, trash.users, 'users', (u) => `${u.name} (${u.email})`)}
                </div>
            )}
        </div>
    );
}
