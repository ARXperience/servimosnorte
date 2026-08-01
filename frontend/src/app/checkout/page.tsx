'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { FiTrash2, FiPlus, FiMinus, FiCreditCard, FiArrowLeft, FiCheckCircle, FiMail, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DeliveryMap from '@/components/DeliveryMap';
// Importaciones de notificaciones admin removidas porque ahora son automáticas por backend

const getApiBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api';
    return url.replace(/\/api\/?$/, '');
};

const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const baseUrl = getApiBaseUrl();
    const imgPath = img.startsWith('/') ? img : `/${img}`;
    return `${baseUrl}${imgPath}`;
};

export default function CheckoutPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'STORE_PICKUP'>('DELIVERY');
    const [delivery, setDelivery] = useState({ address: '', deliveryCost: 0, inCoverage: false, mapClicked: false });
    const [addressDetails, setAddressDetails] = useState({ neighborhood: '', details: '' });
    const [processing, setProcessing] = useState(false);
    const isProcessingRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<any>(null);
    const [pendingOrder, setPendingOrder] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('servimos_cart');
        if (saved) setCart(JSON.parse(saved));
    }, []);

    const updateCart = (newCart: any[]) => {
        setCart(newCart);
        localStorage.setItem('servimos_cart', JSON.stringify(newCart));
    };

    const updateQty = (id: string, delta: number) => {
        const itemToUpdate = cart.find(i => i.id === id);
        
        if (delta > 0 && itemToUpdate && itemToUpdate.quantity >= (itemToUpdate.stock || 1)) {
            toast.error(`Solo hay ${itemToUpdate.stock} unidades disponibles de este producto.`);
            return;
        }

        const newCart = cart.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        );
        updateCart(newCart);
    };

    const removeItem = (id: string) => {
        updateCart(cart.filter((item) => item.id !== id));
        toast.success('Producto eliminado');
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + (deliveryMethod === 'DELIVERY' && delivery.inCoverage ? delivery.deliveryCost : 0);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    const handleCheckout = async (method: string) => {
        if (isProcessingRef.current) return;
        
        if (!form.name || !form.phone) {
            toast.error('Por favor complete nombre y teléfono');
            return;
        }

        // Para domicilios el pago debe ser en línea (no "Pagar en Tienda")
        if (method === 'CASH' && deliveryMethod === 'DELIVERY') {
            toast.error('Para pedidos a domicilio el pago es en línea. Use "Pago en Línea".');
            return;
        }

        if (deliveryMethod === 'DELIVERY') {
            if (!delivery.mapClicked || !delivery.inCoverage) {
                toast.error('Por favor seleccione una ubicación válida en el mapa para el domicilio');
                return;
            }
            if (!delivery.address) {
                toast.error('Por favor escriba su dirección exacta');
                return;
            }
        }

        isProcessingRef.current = true;
        setProcessing(true);
        try {
            let order = pendingOrder;
            
            if (!order) {
                let fullAddress = deliveryMethod === 'STORE_PICKUP' ? 'Recoger en tienda' : delivery.address;
                if (deliveryMethod === 'DELIVERY') {
                    if (addressDetails.neighborhood) fullAddress += `, Barrio: ${addressDetails.neighborhood}`;
                    if (addressDetails.details) fullAddress += `, Detalles: ${addressDetails.details}`;
                }

                order = await api.createOrder({
                    guestName: form.name,
                    guestPhone: form.phone,
                    guestEmail: form.email,
                    shippingAddress: fullAddress,
                    deliveryCost: deliveryMethod === 'STORE_PICKUP' ? 0 : delivery.deliveryCost,
                    items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
                });
                setPendingOrder(order);
            }

            if (method === 'CREDIBANCO') {
                const formEl = document.createElement('form');
                formEl.method = 'post';
                formEl.action = 'https://merchantpw.credibanco.com/cartaspago/redirect';
                
                const fields = {
                    merchant_id: '30089',
                    form_id: '23891',
                    terminal_id: '20047',
                    order_number: order.id.replace(/\D/g, '').slice(0, 10) || Math.floor(Math.random() * 100000).toString(),
                    amount: total.toString(),
                    currency: 'cop',
                    order_description: `Orden de Servimos Norte`,
                    color_base: '#DE073F',
                    client_email: form.email || 'no-email@servimosnorte.com',
                    client_phone: form.phone,
                    client_firstname: form.name.split(' ')[0] || '.',
                    client_lastname: form.name.split(' ').slice(1).join(' ') || '.',
                    client_doctype: '4',
                    client_numdoc: '000000000',
                    response_url: `${window.location.origin}/tienda`,
                };

                Object.entries(fields).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    formEl.appendChild(input);
                });

                document.body.appendChild(formEl);
                // NOTA: Ya no borramos el carrito aquí para que si el usuario se devuelve, no tenga que llenar todo de nuevo.
                // Como reusamos 'pendingOrder', no se crearán duplicados.
                formEl.submit();
            } else {
                await api.createPayment({
                    orderId: order.id,
                    amount: total,
                    method: 'CASH',
                    status: 'PENDING',
                    description: `Pago en efectivo - Orden #${order.id.slice(0, 8)}`,
                });
                localStorage.removeItem('servimos_cart');
                toast.success('¡Orden creada exitosamente!');
                setCreatedOrder(order);
                setCart([]);
            }
        } catch (err: any) {
            toast.error(err.message || 'Error al procesar la orden');
            isProcessingRef.current = false;
        } finally {
            setProcessing(false);
            if (method !== 'CREDIBANCO') {
                isProcessingRef.current = false;
            }
        }
    };

    if (!mounted) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <Footer />
            </>
        );
    }

    if (createdOrder) {
        const radicadoText = createdOrder.radicado || `ORD-${createdOrder.id.slice(0, 8).toUpperCase()}`;

        return (
            <>
                <Navbar />
                <main className="bg-gray-50 min-h-[75vh] py-12 flex items-center justify-center">
                    <div className="max-w-2xl w-full mx-4 card p-8 md:p-10 shadow-2xl border-t-4 border-t-green-500 text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FiCheckCircle size={48} />
                        </div>

                        <h1 className="text-3xl font-black text-primary-500 mb-2">¡Pedido Creado Exitosamente!</h1>
                        <p className="text-gray-600 text-lg mb-4">
                            Tu orden ha sido registrada con el número de orden:
                        </p>
                        <div className="inline-block bg-gray-100 text-primary-600 font-mono text-xl font-bold px-4 py-2 rounded-xl border mb-6 shadow-sm">
                            {radicadoText}
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 text-left border mb-8 space-y-3">
                            <p className="text-sm text-gray-500 font-semibold border-b pb-2">Resumen de Confirmación</p>
                            <p className="text-sm"><strong>Cliente:</strong> {createdOrder.guestName || form.name}</p>
                            <p className="text-sm"><strong>Teléfono:</strong> {createdOrder.guestPhone || form.phone}</p>
                            <p className="text-sm"><strong>Email:</strong> {createdOrder.guestEmail || form.email || 'No registrado'}</p>
                            <p className="text-sm"><strong>Entrega:</strong> {createdOrder.shippingAddress}</p>
                            <p className="text-sm font-bold text-accent-500"><strong>Total:</strong> {formatCurrency(Number(createdOrder.total))}</p>
                        </div>

                        <p className="text-gray-700 font-medium mb-8 bg-blue-50 border border-blue-100 p-5 rounded-xl text-center">
                            Recibirás un correo dentro de los próximos 5 minutos con la confirmación de tu orden. <br />
                            Si no lo encuentras en la bandeja principal, por favor revisa en <strong className="text-blue-700">correo no deseado (spam)</strong>.
                            <br /><br />
                            <span className="text-xl font-bold text-blue-800">¡Gracias por tu compra!</span>
                        </p>

                        <Link href="/tienda" className="inline-flex items-center text-primary-500 hover:underline font-semibold text-sm">
                            <FiArrowLeft className="mr-1" /> Volver a la Tienda
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }


    if (cart.length === 0) {

        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center card p-12">
                        <p className="text-6xl mb-4">🛒</p>
                        <h2 className="text-2xl font-bold text-primary-500 mb-2">Carrito vacío</h2>
                        <p className="text-gray-500 text-lg mb-6">No hay productos en su carrito</p>
                        <Link href="/tienda" className="btn-primary">
                            <FiArrowLeft className="mr-2" /> Ir a la Tienda
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-black text-primary-500 mb-8 animate-fadeInUp text-center">Checkout Seguro</h1>

                    <div className="space-y-10">
                        {/* Resumen del Pedido - Tarjeta Completa */}
                        <div className="card p-6 md:p-8 animate-fadeInUp shadow-xl border-t-4 border-t-primary-500 bg-white">
                            <h2 className="text-2xl font-bold text-primary-500 mb-6 border-b pb-4">Resumen de tu pedido</h2>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50/50">
                                        <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden shadow-sm border border-gray-100">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={getImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                item.category === 'REFURBISHED' ? '🔄' : item.category === 'SPARE_PART' ? '⚙️' : '🔌'
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                                            <h3 className="text-lg font-bold text-primary-500 line-clamp-2">{item.name}</h3>
                                            <p className="text-primary-400 font-medium mt-1">{item.category}</p>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                                            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                                <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors">
                                                    <FiMinus />
                                                </button>
                                                <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors">
                                                    <FiPlus />
                                                </button>
                                            </div>
                                            <div className="font-black text-xl text-primary-500 min-w-[120px] text-center sm:text-right whitespace-nowrap">
                                                {formatCurrency(item.price * item.quantity)}
                                            </div>
                                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <div className="bg-primary-50 text-primary-500 px-6 py-4 rounded-xl font-bold text-xl md:text-2xl flex items-center shadow-sm border border-primary-100">
                                    <span>Total carrito:</span>
                                    <span className="ml-4 font-black">{formatCurrency(subtotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Form - Tarjeta Completa Debajo */}
                        <div className="animate-fadeInUp delay-200">
                            <div className="card p-6 md:p-8 shadow-xl border-t-4 border-t-primary-500 bg-white">
                                <h2 className="text-2xl font-bold text-primary-500 mb-6 border-b pb-4">Datos de Contacto y Entrega</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2">
                                        <label className="label">Nombre Completo *</label>
                                        <input className="input w-full" placeholder="Su nombre" value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Teléfono *</label>
                                        <input className="input w-full" placeholder="312 584 6294" value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Correo Electrónico</label>
                                        <input className="input w-full" placeholder="correo@ejemplo.com" value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-bold text-lg mb-4">Método de Entrega</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div 
                                            onClick={() => setDeliveryMethod('DELIVERY')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${deliveryMethod === 'DELIVERY' ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-gray-200 hover:border-primary-200 text-gray-500'}`}
                                        >
                                            <span className="text-3xl">🛵</span>
                                            <span className="font-bold">A Domicilio</span>
                                        </div>
                                        <div 
                                            onClick={() => setDeliveryMethod('STORE_PICKUP')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${deliveryMethod === 'STORE_PICKUP' ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-gray-200 hover:border-primary-200 text-gray-500'}`}
                                        >
                                            <span className="text-3xl">🏪</span>
                                            <span className="font-bold">Recoger en Tienda</span>
                                        </div>
                                    </div>

                                    {deliveryMethod === 'DELIVERY' ? (
                                        <div className="animate-fadeIn space-y-4">
                                            <DeliveryMap 
                                                onLocationSelect={(data) => setDelivery({ ...data, mapClicked: true })} 
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label text-sm">Barrio (Opcional)</label>
                                                    <input className="input w-full" placeholder="Ej: Cedritos" value={addressDetails.neighborhood}
                                                        onChange={(e) => setAddressDetails({ ...addressDetails, neighborhood: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="label text-sm">Detalles de residencia (Opcional)</label>
                                                    <input className="input w-full" placeholder="Edificio, Torre, Apto, Interior..." value={addressDetails.details}
                                                        onChange={(e) => setAddressDetails({ ...addressDetails, details: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center animate-fadeIn">
                                            <p className="text-gray-600 mb-2">Te esperamos en nuestra sede principal:</p>
                                            <strong className="text-xl text-primary-500 block">Cl. 142 #17 A -5, Local 2</strong>
                                            <p className="text-gray-500 mt-1">Usaquén, Bogotá</p>
                                            <a
                                                href="https://www.google.com/maps/dir/?api=1&destination=4.7235,-74.0487"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
                                            >
                                                📍 Cómo llegar (Google Maps)
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-6 mt-8">
                                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                        <div className="flex justify-between text-gray-600 mb-3 text-lg">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 mb-4 text-lg">
                                            <span>Domicilio</span>
                                            <span className="font-medium">
                                                {deliveryMethod === 'STORE_PICKUP' ? 'Gratis' : 
                                                (delivery.inCoverage ? formatCurrency(delivery.deliveryCost) : '---')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-2xl font-black text-primary-500 pt-4 border-t border-gray-200">
                                            <span>Total a Pagar</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button onClick={() => handleCheckout('CASH')} disabled={processing || deliveryMethod === 'DELIVERY'}
                                            className="btn-outline w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed">
                                            💵 Pagar en Tienda
                                        </button>
                                        <button onClick={() => handleCheckout('CREDIBANCO')} disabled={processing || (deliveryMethod === 'DELIVERY' && !delivery.inCoverage)}
                                            className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <FiCreditCard className="mr-2" /> Pago en Línea
                                        </button>
                                    </div>
                                    {deliveryMethod === 'DELIVERY' && (
                                        <p className="text-xs text-gray-500 mt-3 text-center">
                                            Para pedidos a domicilio el pago es <strong>en línea</strong>. La opción "Pagar en Tienda" solo aplica si recoges en el local.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
