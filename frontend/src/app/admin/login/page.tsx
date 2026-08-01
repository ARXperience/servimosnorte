'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiLock, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.login(email, password);
            api.setToken(data.accessToken);
            localStorage.setItem('servimos_user', JSON.stringify(data.user));
            toast.success(`¡Bienvenido, ${data.user.name}!`);
            router.push('/admin/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-800 p-4">
            <div className="w-full max-w-md animate-fadeInUp">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-extrabold text-3xl">SN</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Servimos Norte</h1>
                    <p className="text-gray-300 mt-2">Panel de Administración</p>
                </div>

                <div className="card p-8">
                    <h2 className="text-xl font-bold text-primary-500 mb-6 text-center">Iniciar Sesión</h2>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="label">
                                <FiMail className="inline mr-2" />
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                required
                                className="input"
                                placeholder="admin@servimosnorte.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="label">
                                <FiLock className="inline mr-2" />
                                Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                    <p className="text-center text-gray-400 text-sm mt-6">
                        Credenciales por defecto: admin@servimosnorte.com / Admin123!
                    </p>
                </div>
            </div>
        </div>
    );
}
