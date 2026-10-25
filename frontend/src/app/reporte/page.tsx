'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiCheckCircle, FiXCircle, FiTool, FiDollarSign, FiClock, FiUser, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente de aprobación',
    ACCEPTED: 'Aceptada',
    REJECTED: 'Rechazada',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completada',
    DELIVERED: 'Entregada',
};

const statusColors: Record<string, string> = {
    PENDING: 'badge-pending',
    ACCEPTED: 'badge-accepted',
    REJECTED: 'badge-rejected',
    IN_PROGRESS: 'badge-in-progress',
    COMPLETED: 'badge-completed',
    DELIVERED: 'badge-completed',
};

function ReporteContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('id');
    const [repair, setRepair] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [responding, setResponding] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        if (token) loadRepair();
    }, [token]);

    const loadRepair = async () => {
        try {
            const data = await api.getRepairByToken(token as string);
            setRepair(data);
        } catch (err: any) {
            setError('No se encontró el reporte de reparación.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!paymentMethod) {
            toast.error('Por favor seleccione un método de pago');
            return;
        }
        setResponding(true);
        try {
            await api.acceptRepair(token as string);

            if (paymentMethod === 'STRIPE') {
                const { url } = await api.createStripeCheckout({
                    repairId: repair.id,
                    amount: repair.cost,
                    method: 'STRIPE',
                    description: `Reparación de ${repair.applianceType} - ${repair.brand}`,
                });
                window.location.href = url;
            } else if (paymentMethod === 'CASH' || paymentMethod === 'TRANSFER') {
                await api.createPayment({
                    repairId: repair.id,
                    amount: repair.cost,
                    method: paymentMethod,
                    status: 'PENDING',
                    description: `Pago en ${paymentMethod === 'CASH' ? 'efectivo' : 'transferencia'} - ${repair.applianceType}`,
                });
                toast.success('¡Reparación aceptada! Pague al recoger su equipo o gestione el pago.');
                loadRepair();
            }
        } catch (err: any) {
            toast.error(err.message || 'Error al procesar');
        } finally {
            setResponding(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('¿Está seguro de que desea rechazar la reparación?')) return;
        setResponding(true);
        try {
            await api.rejectRepair(token as string);
            toast.success('Reparación rechazada');
            loadRepair();
        } catch (err: any) {
            toast.error(err.message || 'Error al rechazar');
        } finally {
            setResponding(false);
        }
    };

    if (!token) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] px-4 bg-gray-50">
                    <div className="text-center panel max-w-md w-full">
                        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5"><FiXCircle size={40} /></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enlace inválido</h2>
                        <p className="text-gray-500">Falta el identificador del reporte.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xl text-gray-500">Cargando reporte...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !repair) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh] px-4 bg-gray-50">
                    <div className="text-center panel max-w-md w-full">
                        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5"><FiXCircle size={40} /></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reporte no encontrado</h2>
                        <p className="text-gray-500">{error || 'El enlace del reporte es inválido o ha expirado.'}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen py-8 sm:py-12">
                <div className="max-w-3xl mx-auto px-4 space-y-6">
                    {/* Header */}
                    <div className="relative overflow-hidden rounded-3xl bg-primary-500 text-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center gap-5 animate-fadeInUp">
                        <div className="absolute -top-16 -right-16 w-56 h-56 bg-accent-500/20 rounded-full blur-3xl" />
                        <div className="relative w-16 h-16 shrink-0 bg-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30">
                            <FiTool className="text-white text-3xl" />
                        </div>
                        <div className="relative flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Reporte de Reparación</h1>
                            <p className="text-white/70">Servimos Norte</p>
                        </div>
                        <span className={`relative self-start sm:self-center ${statusColors[repair.status]} text-sm sm:text-base px-4 py-1.5`}>
                            {statusLabels[repair.status] || repair.status}
                        </span>
                    </div>

                    {/* Report Details */}
                    <div className="panel animate-fadeInUp delay-200">
                        <h2 className="text-xl font-bold text-primary-500 mb-6">Detalles del Equipo</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <span className="label">Tipo de Electrodoméstico</span>
                                <p className="text-lg font-semibold">{repair.applianceType}</p>
                            </div>
                            <div>
                                <span className="label">Marca</span>
                                <p className="text-lg font-semibold">{repair.brand}</p>
                            </div>
                            {repair.model && (
                                <div>
                                    <span className="label">Modelo</span>
                                    <p className="text-lg font-semibold">{repair.model}</p>
                                </div>
                            )}
                            {repair.estimatedTime && (
                                <div className="flex items-start gap-2">
                                    <FiClock className="text-accent-500 mt-1" />
                                    <div>
                                        <span className="label">Tiempo Estimado</span>
                                        <p className="text-lg font-semibold">{repair.estimatedTime}</p>
                                    </div>
                                </div>
                            )}
                            {repair.appointmentDate && (
                                <div className="flex items-start gap-2">
                                    <FiClock className="text-accent-500 mt-1" />
                                    <div>
                                        <span className="label">Día y Hora de Cita</span>
                                        <p className="text-lg font-semibold">{repair.appointmentDate}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Problem & Diagnostic */}
                    <div className="panel animate-fadeInUp delay-300">
                        <h2 className="text-xl font-bold text-primary-500 mb-4">Problema Reportado</h2>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-2xl mb-6 whitespace-pre-line break-words leading-relaxed">
                            {repair.problemDescription}
                        </p>
                        {repair.diagnostic && (
                            <>
                                <h2 className="text-xl font-bold text-primary-500 mb-4">Diagnóstico Técnico</h2>
                                <p className="text-gray-600 bg-blue-50 p-4 rounded-2xl whitespace-pre-line break-words leading-relaxed">
                                    {repair.diagnostic}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Cost */}
                    <div className="panel text-center animate-fadeInUp delay-300 !border-2 !border-accent-200">
                        <FiDollarSign className="text-4xl text-accent-500 mx-auto mb-2" />
                        <h2 className="text-xl font-bold text-primary-500 mb-2">Costo de Reparación</h2>
                        <p className="text-4xl sm:text-5xl font-extrabold text-accent-600 tracking-tight">
                            {formatCurrency(Number(repair.cost))}
                        </p>
                        
                        {Number(repair.deliveryCost) > 0 && (
                            <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-full inline-block text-sm">
                                <span className="font-bold">Costo de Domicilio: </span>
                                <span>{formatCurrency(Number(repair.deliveryCost))}</span>
                            </div>
                        )}
                        <p className="text-gray-400 mt-4">Pesos colombianos (COP)</p>
                    </div>

                    {/* Accept/Reject Actions (only for PENDING) */}
                    {repair.status === 'PENDING' && (
                        <div className="panel animate-fadeInUp delay-400">
                            <h2 className="text-xl font-bold text-primary-500 mb-6 text-center">
                                ¿Desea aceptar la reparación?
                            </h2>

                            {/* Payment Method Selection */}
                            <div className="mb-8">
                                <p className="label">Seleccione método de pago:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                    {[
                                        { value: 'STRIPE', label: '💳 Pagar con Tarjeta', desc: 'Pago online seguro' },
                                        { value: 'CASH', label: '💵 Pagar en Tienda', desc: 'Efectivo al recoger' },
                                        { value: 'TRANSFER', label: '🏦 Transferencia', desc: 'Pago por banco' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setPaymentMethod(opt.value)}
                                            className={`relative p-4 sm:p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === opt.value
                                                ? 'border-accent-500 bg-accent-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            {paymentMethod === opt.value && <FiCheckCircle className="absolute top-3 right-3 text-accent-500" />}
                                            <p className="font-bold text-primary-500">{opt.label}</p>
                                            <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAccept}
                                    disabled={responding}
                                    className="btn-success btn-lg flex-1 disabled:opacity-50"
                                >
                                    <FiCheckCircle className="mr-2 text-xl" />
                                    {responding ? 'Procesando...' : 'Aceptar Reparación'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={responding}
                                    className="btn btn-lg flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                    <FiXCircle className="mr-2 text-xl" />
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Customer Info */}
                    {repair.customer && (
                        <div className="panel animate-fadeInUp delay-400">
                            <h2 className="text-xl font-bold text-primary-500 mb-4">Información del Cliente</h2>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FiUser className="text-xl text-gray-400" />
                                    <span className="font-semibold">{repair.customer.fullName}</span>
                                </div>
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <div className="flex items-center gap-2">
                                    <FiPhone className="text-xl text-gray-400" />
                                    <span>{repair.customer.phone}</span>
                                </div>
                                {repair.customer.address && (
                                    <>
                                        <span className="text-gray-300 hidden sm:inline">|</span>
                                        <div className="flex items-center gap-2">
                                            <FiClock className="text-xl text-gray-400" /> {/* Reusing icon for simplicity */}
                                            <span>{repair.customer.address}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function ReportePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ReporteContent />
        </Suspense>
    );
}
