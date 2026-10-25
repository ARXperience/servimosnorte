'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTool, FiCheckCircle, FiUser, FiMapPin } from 'react-icons/fi';

const Step = ({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) => (
    <h3 className="flex items-center gap-3 font-bold text-lg sm:text-xl text-primary-500 mb-5">
        <span className="relative w-10 h-10 shrink-0 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
            {icon}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-500 text-white text-[11px] font-bold flex items-center justify-center">{n}</span>
        </span>
        {children}
    </h3>
);

export default function SolicitarReparacionPage() {
    const [form, setForm] = useState({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        applianceType: '',
        brand: '',
        problemDescription: '',
    });
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        


        setProcessing(true);
        try {
            await api.requestPublicRepair({
                guestName: form.guestName,
                guestPhone: form.guestPhone,
                guestEmail: form.guestEmail,
                shippingAddress: 'Lleva a Tienda',
                deliveryCost: 0,
                applianceType: form.applianceType,
                brand: form.brand,
                problemDescription: form.problemDescription,
            });
            setSuccess(true);
        } catch (err: any) {
            toast.error(err.message || 'Error al enviar la solicitud');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <>
                <Navbar />
                <main className="min-h-[75vh] py-16 px-4 bg-gray-50 flex items-center justify-center">
                    <div className="panel max-w-lg w-full text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-accent-500/10 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-accent-500/5">
                            <FiCheckCircle size={44} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-primary-500 mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">Hemos recibido tu solicitud de reparación. Un técnico se pondrá en contacto contigo pronto al número que nos proporcionaste.</p>
                        <button onClick={() => window.location.href='/'} className="btn-primary">Volver al Inicio</button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-16 bg-gray-50">
                <PageHeader
                    title="Solicitar Reparación"
                    subtitle="Diligencia el formulario para pre-registrar tu reparación."
                    image="/images/headers/header-servicios.png"
                />
                <div className="max-w-6xl mx-auto px-4 pt-8 sm:pt-12">

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
                        {/* Detalles del Electrodoméstico y Contacto */}
                        <div className="space-y-6">
                            <div className="panel">
                                <Step n={1} icon={<FiTool />}>¿Qué equipo falla?</Step>
                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Tipo de Electrodoméstico *</label>
                                        <input required className="input" placeholder="Ej. Licuadora, Tetera eléctrica, Olla arrocera" value={form.applianceType} onChange={(e) => setForm({...form, applianceType: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Marca *</label>
                                        <input required className="input" placeholder="Ej. Oster, Universal, Imusa" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Descripción del problema *</label>
                                        <textarea required className="input resize-y" rows={4} placeholder="¿Qué le sucede al equipo?" value={form.problemDescription} onChange={(e) => setForm({...form, problemDescription: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="panel">
                                <Step n={2} icon={<FiUser />}>Datos de Contacto</Step>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Nombre y Apellido *</label>
                                        <input required className="input" placeholder="Tu nombre" value={form.guestName} onChange={(e) => setForm({...form, guestName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Teléfono / WhatsApp *</label>
                                        <input required className="input" type="tel" placeholder="312..." value={form.guestPhone} onChange={(e) => setForm({...form, guestPhone: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instrucciones de Entrega */}
                        <div className="panel lg:sticky lg:top-24">
                            <Step n={3} icon={<FiMapPin />}>Método de Entrega</Step>

                            <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-sm leading-relaxed">
                                ℹ️ <strong>Recuerda:</strong> Nuestra tienda está ubicada en <strong>Cl. 142 #17 A -5, Local 2</strong>, Usaquén, Bogotá. Te esperamos en nuestro horario de atención para recibir tu electrodoméstico.
                            </div>

                            <div className="mt-6 border-t border-gray-100 pt-6">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="btn-primary btn-lg w-full disabled:opacity-50"
                                >
                                    {processing ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Al enviar, un técnico se contactará para confirmar. El pago de la revisión o reparación se acuerda con el técnico en la tienda.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
