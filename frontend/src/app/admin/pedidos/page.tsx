'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { getWhatsAppOrderLink, getEmailOrderDraftLink, getGmailOrderDraftLink } from '@/lib/orderNotifications';

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente', PAID: 'Pagada', SHIPPED: 'Enviada',
    DELIVERED: 'Entregada', CANCELLED: 'Cancelada',
};

export default function PedidosPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try { setOrders(await api.getOrders()); } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try { await api.updateOrderStatus(id, status); toast.success('Estado actualizado'); loadOrders(); }
        catch (err: any) { toast.error(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este pedido?')) return;
        try { await api.deleteOrder(id); toast.success('Pedido eliminado'); loadOrders(); }
        catch (err: any) { toast.error(err.message); }
    };

    const formatCurrency = (a: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(a);

    return (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-primary-500">Pedidos</h2>
                <p className="text-xs sm:text-sm text-gray-500">Órdenes de la tienda ({orders.length})</p>
            </div>
            {loading ? (
                <div className="text-center py-10">
                    <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                                <th className="px-2.5 py-3 whitespace-nowrap">N° Orden</th>
                                <th className="px-2.5 py-3">Cliente</th>
                                <th className="px-2.5 py-3">Productos</th>
                                <th className="px-2.5 py-3">Entrega</th>
                                <th className="px-2.5 py-3 whitespace-nowrap">Total</th>
                                <th className="px-2.5 py-3 whitespace-nowrap">Pago</th>
                                <th className="px-2.5 py-3 whitespace-nowrap">Estado</th>
                                <th className="px-2.5 py-3 whitespace-nowrap">Fecha</th>
                                <th className="px-2.5 py-3 whitespace-nowrap text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((o) => {
                                const waUrl = getWhatsAppOrderLink(o);
                                const mailUrl = getEmailOrderDraftLink(o);
                                const gmailUrl = getGmailOrderDraftLink(o);
                                const radicadoText = o.radicado || `ORD-${o.id.slice(0, 8).toUpperCase()}`;

                                return (
                                    <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-2.5 py-2.5 whitespace-nowrap align-middle">
                                            <span className="font-mono text-[11px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-bold border border-gray-200 inline-block">
                                                {radicadoText}
                                            </span>
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle">
                                            <div className="max-w-[130px]">
                                                <p className="font-bold text-gray-900 truncate" title={o.customer?.fullName || o.guestName}>{o.customer?.fullName || o.guestName || 'Invitado'}</p>
                                                <p className="text-[11px] text-gray-500 truncate">{o.customer?.phone || o.guestPhone || ''}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{o.customer?.email || o.guestEmail || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle">
                                            <div className="max-w-[160px] space-y-0.5">
                                                {o.items?.map((i: any) => (
                                                    <p key={i.id} className="text-[11px] text-gray-700 truncate" title={`${i.quantity}x ${i.product?.name}`}>
                                                        <span className="font-bold">{i.quantity}x</span> {i.product?.name}
                                                    </p>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle">
                                            <div className="max-w-[140px]">
                                                {o.shippingAddress === 'Recoger en tienda' ? (
                                                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100 inline-block truncate">
                                                        🏪 En Tienda
                                                    </span>
                                                ) : (
                                                    <p className="text-[11px] text-gray-800 truncate" title={o.shippingAddress}>
                                                        🛵 {o.shippingAddress || 'Sin dirección'}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle font-bold text-accent-500 whitespace-nowrap text-xs">
                                            {formatCurrency(Number(o.total))}
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle text-[10px]">
                                            {o.payments && o.payments.length > 0 ? (
                                                <div className="space-y-0.5">
                                                    <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold uppercase border border-gray-200">
                                                        {o.payments[0].method === 'CASH' ? 'EFECTIVO' : o.payments[0].method === 'TRANSFER' ? 'TRANSFERENCIA' : o.payments[0].method}
                                                    </span>
                                                    {o.payments[0].transactionId && o.payments[0].transactionId !== 'N/A' && (
                                                        <div className="text-gray-400 font-mono mt-1 truncate max-w-[80px]" title={`Trazabilidad: ${o.payments[0].transactionId}`}>
                                                            Ref: {o.payments[0].transactionId}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle whitespace-nowrap">
                                            <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                className="text-[11px] border border-gray-300 rounded px-1.5 py-1 bg-white font-medium focus:ring-1 focus:ring-accent-400 focus:outline-none">
                                                {Object.entries(statusLabels).map(([k, v]) => (
                                                    <option key={k} value={k}>{v}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle text-[11px] text-gray-500 whitespace-nowrap">
                                            <div>{new Date(o.createdAt).toLocaleDateString('es-CO')}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                {new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-2.5 py-2.5 align-middle whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <a
                                                    href={waUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Enviar confirmación por WhatsApp (wa.me)"
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-[11px] font-bold shadow-sm transition-all"
                                                >
                                                    <FaWhatsapp size={12} />
                                                    <span>WA</span>
                                                </a>
                                                <a
                                                    href={gmailUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Abrir en Gmail Web en nueva pestaña"
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold shadow-sm transition-all"
                                                >
                                                    <SiGmail size={12} />
                                                    <span>Gmail</span>
                                                </a>
                                                <a
                                                    href={mailUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Abrir borrador en App de correo por defecto"
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold shadow-sm transition-all"
                                                >
                                                    <FiMail size={12} />
                                                    <span>Mail</span>
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(o.id)}
                                                    title="Eliminar pedido"
                                                    className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-8 text-gray-400 font-medium">No hay pedidos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
