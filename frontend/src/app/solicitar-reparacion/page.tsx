'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeliveryMap from '@/components/DeliveryMap';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTool, FiCheckCircle } from 'react-icons/fi';

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
                <main className="min-h-screen py-20 bg-gray-50 flex items-center justify-center">
                    <div className="card p-10 max-w-lg text-center">
                        <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-primary-500 mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-gray-600 mb-6">Hemos recibido tu solicitud de reparación. Un técnico se pondrá en contacto contigo pronto al número que nos proporcionaste.</p>
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
            <main className="min-h-screen py-10 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h1 className="text-heading text-primary-500 animate-fadeInUp">Solicitar Reparación</h1>
                        <p className="text-gray-600 mt-2">Diligencia el formulario para pre-registrar tu reparación.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Detalles del Electrodoméstico y Contacto */}
                        <div className="space-y-6">
                            <div className="card p-6">
                                <h3 className="font-bold text-lg mb-4 text-primary-500 flex items-center gap-2">
                                    <FiTool /> 1. ¿Qué equipo falla?
                                </h3>
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
                                        <textarea required className="input" rows={3} placeholder="¿Qué le sucede al equipo?" value={form.problemDescription} onChange={(e) => setForm({...form, problemDescription: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h3 className="font-bold text-lg mb-4 text-primary-500">2. Datos de Contacto</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Nombre y Apellido *</label>
                                        <input required className="input" placeholder="Tu nombre" value={form.guestName} onChange={(e) => setForm({...form, guestName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Teléfono / WhatsApp *</label>
                                        <input required className="input" placeholder="312..." value={form.guestPhone} onChange={(e) => setForm({...form, guestPhone: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instrucciones de Entrega */}
                        <div className="card p-6">
                            <h3 className="font-bold text-lg mb-4 text-primary-500">3. Método de Entrega</h3>
                            
                            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200 mb-6">
                                ℹ️ <strong>Recuerda:</strong> Nuestra tienda está ubicada en <strong>Cl. 142 #17 A -5, Local 2</strong>, Usaquén, Bogotá. Te esperamos en nuestro horario de atención para recibir tu electrodoméstico.
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="btn-primary w-full py-4 text-lg"
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
