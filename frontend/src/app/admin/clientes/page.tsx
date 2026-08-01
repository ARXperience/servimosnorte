'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiPhone, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ClientesPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ fullName: '', phone: '', email: '', address: '', notes: '' });

    useEffect(() => { loadCustomers(); }, []);

    const loadCustomers = async (q?: string) => {
        try {
            const data = await api.getCustomers(q);
            setCustomers(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadCustomers(search);
    };

    const openCreateModal = () => {
        setEditing(null);
        setForm({ fullName: '', phone: '', email: '', address: '', notes: '' });
        setShowModal(true);
    };

    const openEditModal = (customer: any) => {
        setEditing(customer);
        setForm({
            fullName: customer.fullName,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            notes: customer.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.updateCustomer(editing.id, form);
                toast.success('Cliente actualizado');
            } else {
                await api.createCustomer(form);
                toast.success('Cliente creado');
            }
            setShowModal(false);
            loadCustomers();
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este cliente?')) return;
        try {
            await api.deleteCustomer(id);
            toast.success('Cliente eliminado');
            loadCustomers();
        } catch (err: any) { toast.error(err.message); }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h2 className="text-heading text-primary-500">Clientes</h2>
                    <p className="text-gray-500">Gestión de clientes ({customers.length})</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary btn-sm">
                    <FiPlus className="mr-2" /> Nuevo Cliente
                </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="input pl-11"
                        placeholder="Buscar por nombre o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-secondary btn-sm">Buscar</button>
            </form>

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
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Dirección</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
                                <tr key={c.id}>
                                    <td className="font-semibold">{c.fullName}</td>
                                    <td>
                                        <span className="flex items-center gap-1"><FiPhone className="text-accent-500" /> {c.phone}</span>
                                    </td>
                                    <td className="text-gray-400">{c.email || '—'}</td>
                                    <td className="text-sm text-gray-500 max-w-[200px] truncate">{c.address || '—'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(c)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                                <FiEdit />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No hay clientes registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg animate-fadeInUp max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">
                                {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label">Nombre completo *</label>
                                <input className="input" required value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Teléfono *</label>
                                <input className="input" required value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Correo electrónico</label>
                                <input className="input" type="email" value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Dirección</label>
                                <input className="input" value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Notas</label>
                                <textarea className="input" rows={3} value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">Guardar</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
