'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { FiTrash2, FiPlus, FiMinus, FiCreditCard, FiArrowLeft, FiCheckCircle, FiLock, FiShoppingBag, FiUser, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DeliveryMap from '@/components/DeliveryMap';
import { categoryLabels, getImageUrl, formatCurrency } from '@/components/ProductCard';
// Importaciones de notificaciones admin removidas porque ahora son automáticas por backend

const deliveryOptions = [
    { value: 'DELIVERY', icon: '🛵', label: 'A Domicilio' },
    { value: 'STORE_PICKUP', icon: '🏪', label: 'Recoger en Tienda' },
] as const;

const sectionIcon = 'w-10 h-10 shrink-0 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center';

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
        const summary = [
            ['Cliente:', createdOrder.guestName || form.name],
            ['Teléfono:', createdOrder.guestPhone || form.phone],
            ['Email:', createdOrder.guestEmail || form.email || 'No registrado'],
            ['Entrega:', createdOrder.shippingAddress],
        ];

        return (
            <>
                <Navbar />
                <main className="bg-gray-50 min-h-[75vh] py-10 sm:py-16 px-4 flex items-center justify-center">
                    <div className="panel max-w-2xl w-full text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-accent-500/10 text-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-accent-500/5">
                            <FiCheckCircle size={44} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-500 mb-2">¡Pedido Creado Exitosamente!</h1>
                        <p className="text-gray-500 sm:text-lg mb-4">
                            Tu orden ha sido registrada con el número de orden:
                        </p>
                        <div className="inline-block bg-primary-50 text-primary-600 font-mono text-lg sm:text-xl font-bold px-5 py-2 rounded-full mb-8 break-all">
                            {radicadoText}
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 text-left mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Resumen de Confirmación</p>
                            <dl className="divide-y divide-gray-200/70 text-sm">
                                {summary.map(([label, value]) => (
                                    <div key={label} className="flex gap-4 justify-between py-2.5">
                                        <dt className="text-gray-500 shrink-0">{label}</dt>
                                        <dd className="font-semibold text-gray-800 text-right break-words min-w-0">{value}</dd>
                                    </div>
                                ))}
                                <div className="flex gap-4 justify-between pt-3">
                                    <dt className="font-bold text-primary-500">Total:</dt>
                                    <dd className="text-lg font-extrabold text-accent-600">{formatCurrency(Number(createdOrder.total))}</dd>
                                </div>
                            </dl>
                        </div>

                        <p className="text-gray-600 mb-8 bg-blue-50 p-5 rounded-2xl text-center text-sm sm:text-base leading-relaxed">
                            Recibirás un correo dentro de los próximos 5 minutos con la confirmación de tu orden. <br />
                            Si no lo encuentras en la bandeja principal, por favor revisa en <strong className="text-blue-700">correo no deseado (spam)</strong>.
                            <br /><br />
                            <span className="text-lg sm:text-xl font-bold text-blue-800">¡Gracias por tu compra!</span>
                        </p>

                        <Link href="/tienda" className="btn-secondary">
                            <FiArrowLeft className="mr-2" /> Volver a la Tienda
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
                <main className="bg-gray-50 min-h-[60vh] py-12 px-4 flex items-center justify-center">
                    <div className="panel text-center max-w-md w-full">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mx-auto mb-5">🛒</div>
                        <h2 className="text-2xl font-bold text-primary-500 mb-2">Carrito vacío</h2>
                        <p className="text-gray-500 mb-6">No hay productos en su carrito</p>
                        <Link href="/tienda" className="btn-primary">
                            <FiArrowLeft className="mr-2" /> Ir a la Tienda
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="bg-gray-50 min-h-screen pb-16">
                <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10">
                    <Link href="/tienda" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-500 mb-3">
                        <FiArrowLeft /> Volver a la Tienda
                    </Link>
                    <h1 className="page-title flex items-center gap-3 mb-6 sm:mb-8 animate-fadeInUp">
                        <span className="w-11 h-11 shrink-0 rounded-2xl bg-accent-500/10 text-accent-600 flex items-center justify-center">
                            <FiLock className="text-xl" />
                        </span>
                        Checkout Seguro
                    </h1>

                    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
                        <div className="space-y-6 min-w-0">
                            {/* Resumen del Pedido */}
                            <section className="panel animate-fadeInUp">
                                <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-primary-500 mb-5">
                                    <span className={sectionIcon}><FiShoppingBag /></span>
                                    Resumen de tu pedido
                                </h2>
                                <ul className="divide-y divide-gray-100">
                                    {cart.map((item) => (
                                        <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl overflow-hidden border border-gray-100">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={getImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-contain p-1.5 mix-blend-multiply" />
                                                ) : (
                                                    item.category === 'REFURBISHED' ? '🔄' : item.category === 'SPARE_PART' ? '⚙️' : '🔌'
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-primary-500 leading-snug line-clamp-2">{item.name}</h3>
                                                        <p className="text-sm text-gray-400 mt-0.5">{categoryLabels[item.category] || item.category}</p>
                                                    </div>
                                                    <button onClick={() => removeItem(item.id)} aria-label="Eliminar producto" className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                                                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white">
                                                        <button onClick={() => updateQty(item.id, -1)} aria-label="Quitar uno" className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-primary-500 rounded-full transition-colors">
                                                            <FiMinus />
                                                        </button>
                                                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQty(item.id, 1)} aria-label="Agregar uno" className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-primary-500 rounded-full transition-colors">
                                                            <FiPlus />
                                                        </button>
                                                    </div>
                                                    <p className="font-extrabold text-lg text-primary-500 whitespace-nowrap">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between font-bold text-primary-500">
                                    <span>Total carrito:</span>
                                    <span className="text-xl font-extrabold">{formatCurrency(subtotal)}</span>
                                </div>
                            </section>

                            {/* Datos de contacto y entrega */}
                            <section className="panel animate-fadeInUp delay-200">
                                <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-primary-500 mb-6">
                                    <span className={sectionIcon}><FiUser /></span>
                                    Datos de Contacto y Entrega
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
                                    <div className="sm:col-span-2">
                                        <label className="label">Nombre Completo *</label>
                                        <input className="input" placeholder="Su nombre" value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Teléfono *</label>
                                        <input className="input" type="tel" placeholder="312 584 6294" value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Correo Electrónico</label>
                                        <input className="input" type="email" placeholder="correo@ejemplo.com" value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                </div>

                                <h3 className="flex items-center gap-2 font-bold text-lg text-primary-500 mb-4">
                                    <FiMapPin className="text-accent-500" /> Método de Entrega
                                </h3>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                                    {deliveryOptions.map((opt) => {
                                        const active = deliveryMethod === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => setDeliveryMethod(opt.value)}
                                                className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${active ? 'border-primary-500 bg-primary-50 text-primary-500' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                                            >
                                                {active && <FiCheckCircle className="absolute top-3 right-3 text-accent-500" />}
                                                <span className="text-3xl">{opt.icon}</span>
                                                <span className="font-bold text-sm sm:text-base">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {deliveryMethod === 'DELIVERY' ? (
                                    <div className="animate-fadeIn space-y-4">
                                        <DeliveryMap
                                            onLocationSelect={(data) => setDelivery({ ...data, mapClicked: true })}
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label text-sm">Barrio (Opcional)</label>
                                                <input className="input" placeholder="Ej: Cedritos" value={addressDetails.neighborhood}
                                                    onChange={(e) => setAddressDetails({ ...addressDetails, neighborhood: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="label text-sm">Detalles de residencia (Opcional)</label>
                                                <input className="input" placeholder="Edificio, Torre, Apto, Interior..." value={addressDetails.details}
                                                    onChange={(e) => setAddressDetails({ ...addressDetails, details: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-gray-50 rounded-2xl text-center animate-fadeIn">
                                        <p className="text-gray-500 mb-2">Te esperamos en nuestra sede principal:</p>
                                        <strong className="text-xl text-primary-500 block">Cl. 142 #17 A -5, Local 2</strong>
                                        <p className="text-gray-500 mt-1">Usaquén, Bogotá</p>
                                        <a
                                            href="https://www.google.com/maps/dir/?api=1&destination=4.7235,-74.0487"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary btn-sm mt-4"
                                        >
                                            📍 Cómo llegar (Google Maps)
                                        </a>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Totales y pago */}
                        <aside className="panel lg:sticky lg:top-24 animate-fadeInUp delay-300">
                            <div className="space-y-3 text-gray-500">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Domicilio</span>
                                    <span className="font-semibold text-gray-800">
                                        {deliveryMethod === 'STORE_PICKUP' ? 'Gratis' :
                                        (delivery.inCoverage ? formatCurrency(delivery.deliveryCost) : '---')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                <span className="font-bold text-primary-500">Total a Pagar</span>
                                <span className="text-2xl font-extrabold text-primary-500">{formatCurrency(total)}</span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button onClick={() => handleCheckout('CREDIBANCO')} disabled={processing || (deliveryMethod === 'DELIVERY' && !delivery.inCoverage)}
                                    className="btn-primary btn-lg w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                                    <FiCreditCard className="mr-2" /> Pago en Línea
                                </button>
                                <button onClick={() => handleCheckout('CASH')} disabled={processing || deliveryMethod === 'DELIVERY'}
                                    className="btn-outline btn-lg w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                                    💵 Pagar en Tienda
                                </button>
                            </div>
                            {deliveryMethod === 'DELIVERY' && (
                                <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                                    Para pedidos a domicilio el pago es <strong>en línea</strong>. La opción "Pagar en Tienda" solo aplica si recoges en el local.
                                </p>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
