'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiTrash2, FiX, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UsuariosPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
    const [passwordForm, setPasswordForm] = useState('');

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreateModal = () => {
        setForm({ name: '', email: '', password: '', role: 'ADMIN' });
        setShowModal(true);
    };

    const openPasswordModal = (user: any) => {
        setSelectedUser(user);
        setPasswordForm('');
        setShowPasswordModal(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createUser(form);
            toast.success('Usuario creado');
            setShowModal(false);
            loadUsers();
        } catch (err: any) {
            toast.error(err.message || 'Error al crear');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updateUserPassword(selectedUser.id, passwordForm);
            toast.success('Contraseña actualizada');
            setShowPasswordModal(false);
        } catch (err: any) {
            toast.error(err.message || 'Error al actualizar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este usuario administrador?')) return;
        try {
            await api.deleteUser(id);
            toast.success('Usuario eliminado');
            loadUsers();
        } catch (err: any) { toast.error(err.message); }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h2 className="text-heading text-primary-500">Usuarios Administradores</h2>
                    <p className="text-gray-500">Gestión de acceso al sistema ({users.length})</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary btn-sm">
                    <FiPlus className="mr-2" /> Nuevo Usuario
                </button>
            </div>

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
                                <th>Correo</th>
                                <th>Rol</th>
                                <th>Fecha de creación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="font-semibold">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-bold">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => openPasswordModal(u)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Cambiar Contraseña">
                                                <FiLock />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar Usuario">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No hay usuarios registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md animate-fadeInUp">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">Nuevo Usuario</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="label">Nombre completo *</label>
                                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Correo electrónico *</label>
                                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Contraseña *</label>
                                <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">Crear</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm animate-fadeInUp">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-primary-500">Cambiar Contraseña</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <p className="text-sm text-gray-500 mb-2">Nueva contraseña para <strong>{selectedUser?.name}</strong>:</p>
                            <div>
                                <input className="input" type="password" required value={passwordForm} onChange={(e) => setPasswordForm(e.target.value)} placeholder="Ej: NuevaClave123" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1">Actualizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
