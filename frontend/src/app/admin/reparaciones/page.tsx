'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiEdit, FiTrash2, FiSend, FiX, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada',
    IN_PROGRESS: 'En Progreso', COMPLETED: 'Completada', DELIVERED: 'Entregada',
};
const statusClasses: Record<string, string> = {
    PENDING: 'badge-pending', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected',
    IN_PROGRESS: 'badge-in-progress', COMPLETED: 'badge-completed', DELIVERED: 'badge-completed',
};
const paymentLabels: Record<string, string> = { UNPAID: 'Sin Pagar', PARTIAL: 'Parcial', PAID: 'Pagado' };
const paymentClasses: Record<string, string> = { UNPAID: 'badge-unpaid', PARTIAL: 'badge-partial', PAID: 'badge-paid' };

export default function ReparacionesPage() {
    const [repairs, setRepairs] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [form, setForm] = useState({
        customerId: '', customerAddress: '', appointmentDate: '', applianceType: '', brand: '', model: '',
        problemDescription: '', diagnostic: '', cost: 0, estimatedTime: '', technicianNotes: '',
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [r, c] = await Promise.all([api.getRepairs(), api.getCustomers()]);
            setRepairs(r);
            setCustomers(c);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filtered = filter ? repairs.filter((r) => r.status === filter) : repairs;

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.updateRepair(editingId, { 
                    applianceType: form.applianceType, brand: form.brand, model: form.model,
                    problemDescription: form.problemDescription, diagnostic: form.diagnostic,
                    appointmentDate: form.appointmentDate, estimatedTime: form.estimatedTime,
                    technicianNotes: form.technicianNotes, cost: Number(form.cost)
                });
                if (form.customerId && form.customerAddress) {
                    await api.updateCustomer(form.customerId, { address: form.customerAddress });
                }
                toast.success('Reparación actualizada');
            } else {
                const { customerAddress, ...repairData } = form;
                await api.createRepair({ ...repairData, cost: Number(form.cost) });
                if (form.customerId && form.customerAddress) {
                    await api.updateCustomer(form.customerId, { address: form.customerAddress });
                }
                toast.success('Reparación creada');
            }
            setShowModal(false);
            setEditingId(null);
            loadData();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await api.updateRepairStatus(id, status);
            toast.success('Estado actualizado');
            loadData();
        } catch (err: any) { toast.error(err.message); }
    };

    const sendWhatsApp = async (repair: any) => {
        try {
            const { url } = await api.getWhatsappReportLink(
                repair.customer.phone, repair.publicToken, repair.customer.fullName
            );
            window.open(url, '_blank');
        } catch (err: any) { toast.error(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta reparación?')) return;
        try {
            await api.deleteRepair(id);
            toast.success('Eliminada');
            loadData();
        } catch (err: any) { toast.error(err.message); }
    };

    const handleEdit = (r: any) => {
        setForm({
            customerId: r.customerId,
            customerAddress: r.customer?.address || '',
            appointmentDate: r.appointmentDate || '',
            applianceType: r.applianceType || '',
            brand: r.brand || '',
            model: r.model || '',
            problemDescription: r.problemDescription || '',
            diagnostic: r.diagnostic || '',
            cost: r.cost || 0,
            estimatedTime: r.estimatedTime || '',
            technicianNotes: r.technicianNotes || '',
        });
        setEditingId(r.id);
        setShowModal(true);
    };

    const handleOpenNew = () => {
        setForm({
            customerId: '', customerAddress: '', appointmentDate: '', applianceType: '', brand: '', model: '',
            problemDescription: '', diagnostic: '', cost: 0, estimatedTime: '', technicianNotes: '',
        });
        setEditingId(null);
        setShowModal(true);
    };

    const formatCurrency = (a: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(a);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h2 className="text-heading text-primary-500">Reparaciones</h2>
                    <p className="text-gray-500">Gestión de reportes ({repairs.length})</p>
                </div>
                <button onClick={handleOpenNew} className="btn-primary btn-sm">
                    <FiPlus className="mr-2" /> Nueva Reparación
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilter('')}
                    className={`btn-sm rounded-xl px-5 ${!filter ? 'bg-accent-500 text-white' : 'bg-white border border-gray-200'}`}>
                    Todas
                </button>
                {Object.entries(statusLabels).map(([key, label]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className={`btn-sm rounded-xl px-5 ${filter === key ? 'bg-accent-500 text-white' : 'bg-white border border-gray-200'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Cita</th>
                                <th>Equipo</th>
                                <th>Costo</th>
                                <th>Estado</th>
                                <th>Pago</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <div>
                                            <p className="font-semibold">{r.customer?.fullName}</p>
                                            <p className="text-sm text-gray-400">{r.customer?.phone}</p>
                                            <p className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={r.customer?.address}>{r.customer?.address || 'Sin dirección'}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm font-medium">{r.appointmentDate || 'No agendada'}</p>
                                    </td>
                                    <td>
                                        <p className="font-semibold">{r.applianceType}</p>
                                        <p className="text-sm text-gray-400">{r.brand} {r.model}</p>
                                    </td>
                                    <td className="font-bold text-accent-500">{formatCurrency(Number(r.cost))}</td>
                                    <td>
                                        <select
                                            value={r.status}
                                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                                            className="text-sm border rounded-lg px-2 py-1.5 bg-white"
                                        >
                                            {Object.entries(statusLabels).map(([k, v]) => (
                                                <option key={k} value={k}>{v}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><span className={paymentClasses[r.paymentStatus]}>{paymentLabels[r.paymentStatus]}</span></td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(r)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg" title="Editar">
                                                <FiEdit />
                                            </button>
                                            <button onClick={() => sendWhatsApp(r)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Enviar por WhatsApp">
                                                <FiSend />
                                            </button>
                                            <a href={`/reporte?id=${r.publicToken}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Ver reporte">
                                                <FiExternalLink />
                                            </a>
                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay reparaciones</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl animate-fadeInUp max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">{editingId ? 'Editar Reparación / Cita' : 'Nueva Reparación'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="text-xl" /></button>
                        </div>
                        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Cliente *</label>
                                    <select className="input" required value={form.customerId} disabled={!!editingId}
                                        onChange={(e) => {
                                            const cs = customers.find(c => c.id === e.target.value);
                                            setForm({ ...form, customerId: e.target.value, customerAddress: cs?.address || '' });
                                        }}>
                                        <option value="">Seleccionar cliente...</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Dirección (Se actualizará en el cliente)</label>
                                    <input className="input" value={form.customerAddress}
                                        onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} placeholder="Ej: Carrera 12 #34-56" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="label">Electrodoméstico *</label>
                                    <input className="input" required value={form.applianceType}
                                        onChange={(e) => setForm({ ...form, applianceType: e.target.value })} placeholder="Licuadora" />
                                </div>
                                <div>
                                    <label className="label">Marca *</label>
                                    <input className="input" required value={form.brand}
                                        onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Samsung" />
                                </div>
                                <div>
                                    <label className="label">Modelo</label>
                                    <input className="input" value={form.model}
                                        onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="WF45R" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Problema *</label>
                                <textarea className="input" rows={3} required value={form.problemDescription}
                                    onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                                    placeholder="Describa el problema..." />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Diagnóstico</label>
                                    <textarea className="input" rows={3} value={form.diagnostic}
                                        onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
                                        placeholder="Resultado del diagnóstico..." />
                                </div>
                                <div>
                                    <label className="label">Día y Hora de Cita</label>
                                    <textarea className="input" rows={3} value={form.appointmentDate}
                                        onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                                        placeholder="Ej: Lunes 15 de Oct 3:00 PM" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Costo (COP)</label>
                                    <input className="input" type="number" value={form.cost}
                                        onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="label">Tiempo estimado</label>
                                    <input className="input" value={form.estimatedTime}
                                        onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} placeholder="3-5 días" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Notas del técnico</label>
                                <textarea className="input" rows={2} value={form.technicianNotes}
                                    onChange={(e) => setForm({ ...form, technicianNotes: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">{editingId ? 'Guardar Cambios' : 'Crear Reporte'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
