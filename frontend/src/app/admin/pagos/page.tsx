'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const methodLabels: Record<string, string> = { STRIPE: 'Tarjeta', BOLD: 'Bold', CASH: 'Efectivo', TRANSFER: 'Transferencia' };
const statusLabels: Record<string, string> = { PENDING: 'Pendiente', COMPLETED: 'Completado', FAILED: 'Fallido', REFUNDED: 'Reembolsado' };
const statusClasses: Record<string, string> = { PENDING: 'badge-pending', COMPLETED: 'badge-paid', FAILED: 'badge-rejected', REFUNDED: 'badge-partial' };

export default function PagosPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadPayments(); }, []);

    const loadPayments = async () => {
        try { setPayments(await api.getPayments()); } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const formatCurrency = (a: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(a);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-heading text-primary-500">Pagos</h2>
                <p className="text-gray-500">Historial de pagos ({payments.length})</p>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Tipo</th><th>Estado</th><th>Descripción</th></tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.id}>
                                    <td className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString('es-CO')}</td>
                                    <td className="font-bold text-accent-500">{formatCurrency(Number(p.amount))}</td>
                                    <td><span className="badge bg-gray-100 text-gray-700">{methodLabels[p.method] || p.method}</span></td>
                                    <td className="text-sm">{p.repairId ? '🔧 Reparación' : '📦 Venta'}</td>
                                    <td>
                                        <select
                                            value={p.status}
                                            onChange={async (e) => {
                                                try {
                                                    await api.updatePaymentStatus(p.id, e.target.value);
                                                    toast.success('Estado de pago actualizado');
                                                    loadPayments();
                                                } catch (err: any) { toast.error(err.message); }
                                            }}
                                            className={`text-sm border rounded-lg px-2 py-1.5 ${statusClasses[p.status]}`}
                                        >
                                            {Object.entries(statusLabels).map(([k, v]) => (
                                                <option key={k} value={k}>{v}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="text-sm text-gray-400 max-w-xs truncate">{p.description || '—'}</td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay pagos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
