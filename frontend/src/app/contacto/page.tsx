'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactoPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            // Register in the system
            await api.registerContact({
                fullName: form.name,
                phone: form.phone,
                email: form.email,
                notes: form.message
            });
            
            // Generate WhatsApp message
            const msg = `Hola Servimos Norte, soy ${form.name}. ${form.message}. Mi teléfono: ${form.phone}`;
            const waUrl = `https://wa.me/573125846294?text=${encodeURIComponent(msg)}`;
            window.open(waUrl, '_blank');
            toast.success('¡Mensaje registrado y redirigiendo a WhatsApp!');
            setForm({ name: '', phone: '', email: '', message: '' });
        } catch (err: any) {
            toast.error('Ocurrió un error registrando el mensaje.');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Navbar />
            <main>
                <section className="relative bg-primary-500 text-white py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/headers/header-contacto.png')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/70 to-primary-500/50"></div>
                    <div className="absolute right-0 sm:right-20 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                        <img src="/logo.png" alt="Servimos Norte" className="w-64 sm:w-96 object-contain" />
                    </div>
                    <div className="section py-0 relative z-10">
                        <h1 className="text-2xl sm:text-heading-xl text-white mb-4 animate-fadeInUp break-words">Contáctenos</h1>
                        <p className="text-base sm:text-xl text-gray-200 max-w-3xl animate-fadeInUp delay-100">
                            Estamos aquí para ayudarle. Contáctenos por teléfono, WhatsApp o complete el formulario.
                        </p>
                    </div>
                </section>

                <section className="section">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="animate-fadeInUp">
                            <h2 className="text-2xl font-bold text-primary-500 mb-8">Información de Contacto</h2>
                            <div className="space-y-8">
                                {[
                                    {
                                        icon: <FiPhone className="text-2xl" />,
                                        title: 'Teléfono',
                                        content: '312 584 6294',
                                        action: <a href="tel:+573125846294" className="btn-primary btn-sm mt-3">Llamar Ahora</a>,
                                    },
                                    {
                                        icon: <FiMail className="text-2xl" />,
                                        title: 'Correo Electrónico',
                                        content: 'servimosnorte@gmail.com',
                                    },
                                    {
                                        icon: <FiMapPin className="text-2xl" />,
                                        title: 'Dirección',
                                        content: 'Cl. 142 #17 A -5, Local 2, Usaquén, Bogotá',
                                    },
                                    {
                                        icon: <FiClock className="text-2xl" />,
                                        title: 'Horario de Atención',
                                        content: 'Lun a Jue: 9:00 AM - 7:00 PM | Vie: 9:00 AM - 6:00 PM | Sáb: 9:00 AM - 2:00 PM',
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-5">
                                        <div className="w-14 h-14 bg-accent-50 text-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary-500">{item.title}</h3>
                                            <p className="text-gray-600 text-body">{item.content}</p>
                                            {item.action}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* WhatsApp CTA */}
                            <div className="mt-10 p-6 bg-green-50 rounded-2xl border border-green-200">
                                <h3 className="font-bold text-lg text-green-800 mb-2">💬 Escríbanos por WhatsApp</h3>
                                <p className="text-green-700 mb-4">La forma más rápida de comunicarse con nosotros.</p>
                                <a
                                    href="https://wa.me/573125846294?text=Hola%2C%20necesito%20un%20servicio%20de%20reparación"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn bg-green-500 text-white hover:bg-green-600 font-bold"
                                >
                                    Abrir WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="animate-fadeInUp delay-200">
                            <div className="card p-8 lg:p-10">
                                <h2 className="text-2xl font-bold text-primary-500 mb-6">Enviar Mensaje</h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="label">Nombre completo *</label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            placeholder="Su nombre completo"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Teléfono *</label>
                                        <input
                                            type="tel"
                                            required
                                            className="input"
                                            placeholder="312 584 6294"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Correo electrónico</label>
                                        <input
                                            type="email"
                                            className="input"
                                            placeholder="correo@ejemplo.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Mensaje *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            className="input"
                                            placeholder="Describa el problema con su electrodoméstico..."
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" disabled={sending} className="btn-primary btn-lg w-full">
                                        <FiSend className="mr-2" />
                                        {sending ? 'Enviando...' : 'Enviar por WhatsApp'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
