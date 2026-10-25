import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCarousel from '@/components/ProductCarousel';
import { FiTool, FiShoppingBag, FiCheckCircle, FiPhone, FiStar, FiShield, FiClock, FiArrowRight, FiMessageCircle } from 'react-icons/fi';

const services = [
    { img: '/services/licuadora.png', title: 'Reparación de Licuadoras', desc: 'Servicio técnico para licuadoras de todas las marcas. Diagnóstico profesional.' },
    { img: '/services/aspiradora.png', title: 'Reparación de Aspiradoras', desc: 'Mantenimiento y reparación de aspiradoras. Optimizamos su potencia de succión.' },
    { img: '/services/microondas.png', title: 'Reparación de Microondas', desc: 'Diagnóstico y reparación de hornos microondas. Cambio de magnetrón.' },
    { img: '/services/airfryer.png', title: 'Reparación de Air Fryers', desc: 'Reparación de freidoras de aire. Mantenimiento del panel y resistencias.' },
    { img: '/services/secador.png', title: 'Reparación de Secadores de Pelo', desc: 'Revisión y arreglo de secadores profesionales y de hogar.' },
    { img: '/services/olla-presion.png', title: 'Reparación de Ollas a Presión', desc: 'Cambio de válvulas y empaques. Garantizamos la seguridad de sus ollas.' },
    { img: '/services/olla-multiusos.png', title: 'Reparación de Ollas Multiusos', desc: 'Mantenimiento de ollas eléctricas y programables de todas las marcas.' },
    { img: '/services/plancha.png', title: 'Reparación de Planchas', desc: 'Limpieza y reparación de planchas a vapor y convencionales.' },
    { img: '/services/horno.png', title: 'Reparación de Hornos', desc: 'Hornos eléctricos convencionales. Servicio rápido y repuestos originales.' },
    { img: '/services/sanduchera.png', title: 'Reparación de Sanducheras', desc: 'Arreglo de resistencias y cableado para sanducheras de todo tipo.' },
    { img: '/services/kitchenaid.png', title: 'Reparación de Batidoras KitchenAid', desc: 'Servicio especializado y mantenimiento de batidoras KitchenAid.' },
];

const highlights = [
    { icon: <FiStar />, title: '+30 años', desc: 'De experiencia' },
    { icon: <FiShield />, title: 'Garantía', desc: 'En todas las reparaciones' },
    { icon: <FiClock />, title: 'Servicio rápido', desc: 'Diagnóstico el mismo día' },
    { icon: <FiPhone />, title: 'Atención', desc: 'Personalizada y cercana' },
];

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative text-white overflow-hidden min-h-[70vh] sm:min-h-[82vh] flex items-center">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                        <source src="/portada.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/95 via-primary-500/70 to-primary-500/10" />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary-500/60 to-transparent" />
                    <div className="section relative z-10 w-full pb-24 sm:pb-32">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 text-sm font-semibold text-white/90 animate-fadeInUp">
                                <span className="w-2 h-2 rounded-full bg-accent-400" /> Servicio técnico en Bogotá · +30 años
                            </span>
                            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-white animate-fadeInUp delay-100">
                                Reparamos sus electrodomésticos con <span className="text-accent-400">garantía profesional</span>
                            </h1>
                            <p className="mt-5 text-base sm:text-lg text-white/80 max-w-xl leading-relaxed animate-fadeInUp delay-200">
                                Más de 30 años de experiencia en reparación de licuadoras, aspiradoras, microondas y más.
                                Servicio rápido, confiable y a precios justos en toda Bogotá.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-fadeInUp delay-300">
                                <Link href="/contacto" className="btn-primary btn-lg">
                                    Solicitar Servicio <FiArrowRight className="ml-2" />
                                </Link>
                                <Link href="/servicios" className="btn btn-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/25">
                                    Ver Servicios
                                </Link>
                                <Link href="/tienda" className="btn btn-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/25">
                                    <FiShoppingBag className="mr-2" /> Ver Tienda
                                </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-white/80 animate-fadeInUp delay-400">
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-accent-400" /> Garantía</span>
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-accent-400" /> Servicio rápido</span>
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-accent-400" /> Precios justos</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why us strip, overlapping the hero */}
                <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-20">
                    <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 overflow-hidden xl:flex">
                        <div className="p-5 sm:p-6 xl:w-72 shrink-0 border-b xl:border-b-0 xl:border-r border-gray-100">
                            <h2 className="text-lg sm:text-xl font-extrabold text-primary-500">¿Por qué elegirnos?</h2>
                            <p className="text-sm text-gray-500 mt-1">Somos su mejor opción para la reparación de electrodomésticos en Bogotá</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 flex-1">
                        {highlights.map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-6 ${i % 2 ? 'border-l border-gray-100' : ''} ${i > 1 ? 'border-t lg:border-t-0 border-gray-100' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
                                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center text-xl">
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-extrabold text-primary-500 leading-tight">{item.title}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </section>

                {/* Products Carousel */}
                <ProductCarousel />

                {/* Services Section */}
                <section className="bg-gray-50" id="servicios">
                    <div className="section">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                            <div className="max-w-2xl">
                                <p className="eyebrow">Servicios</p>
                                <h2 className="page-title">Nuestros Servicios</h2>
                                <p className="text-gray-500">Ofrecemos reparación profesional para todo tipo de electrodomésticos del hogar</p>
                            </div>
                            <Link href="/servicios" className="inline-flex items-center gap-2 font-semibold text-accent-600 hover:text-accent-700 shrink-0">
                                Ver todos los servicios <FiArrowRight />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                            {services.map((service) => (
                                <Link
                                    key={service.title}
                                    href="/contacto"
                                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-[5/4] bg-white overflow-hidden">
                                        <img src={service.img} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-3 sm:p-5 border-t border-gray-50">
                                        <h3 className="text-sm sm:text-lg font-bold text-primary-500 leading-snug">{service.title}</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">{service.desc}</p>
                                        <span className="inline-flex items-center gap-1.5 mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-accent-600 group-hover:gap-2.5 transition-all">
                                            Solicitar reparación <FiArrowRight />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            <Link
                                href="/contacto"
                                className="group rounded-2xl bg-primary-500 text-white p-4 sm:p-6 flex flex-col justify-between hover:bg-primary-600 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <FiTool className="text-2xl text-accent-400" />
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-sm sm:text-lg font-bold text-white">Otros Electrodomésticos</h3>
                                    <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed">
                                        ¿No ve su equipo en la lista? También reparamos una amplia variedad de electrodomésticos adicionales. Consúltenos.
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-accent-400">
                                        Consúltenos <FiArrowRight />
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section">
                    <div className="relative overflow-hidden rounded-3xl bg-primary-500 px-6 py-12 sm:px-12 sm:py-16 text-center">
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-500/30 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">¿Necesita reparar un electrodoméstico?</h2>
                            <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto mb-8">
                                Contáctenos hoy y reciba un diagnóstico profesional. Servicio rápido y precios competitivos.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <a href="tel:+573125846294" className="btn-primary btn-lg">
                                    <FiPhone className="mr-2" /> Llamar Ahora
                                </a>
                                <Link href="/contacto" className="btn btn-lg border border-white/30 text-white hover:bg-white/10">
                                    <FiMessageCircle className="mr-2" /> Enviar Mensaje
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Store Preview */}
                <section className="section pt-0 text-center">
                    <p className="eyebrow">Tienda</p>
                    <h2 className="page-title">Nuestra Tienda</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto mb-8">
                        Repuestos, accesorios y electrodomésticos reacondicionados con garantía
                    </p>
                    <Link href="/tienda" className="btn-primary btn-lg">
                        <FiShoppingBag className="mr-2" /> Visitar Tienda
                    </Link>
                </section>
            </main>
            <Footer />
        </>
    );
}
