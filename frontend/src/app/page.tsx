import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiTool, FiShoppingBag, FiCheckCircle, FiPhone, FiStar, FiShield, FiClock, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="relative text-white overflow-hidden min-h-[60vh] sm:min-h-[80vh] flex items-center">
                    {/* Video Background */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/portada.mp4" type="video/mp4" />
                    </video>
                    {/* Subtle gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent"></div>
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
                    </div>
                    <div className="section relative py-12 sm:py-24 lg:py-32 z-10 w-full">
                        <div className="max-w-3xl bg-black/40 p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
                            <h1 className="text-2xl sm:text-heading-xl lg:text-[3.5rem] leading-tight text-white animate-fadeInUp">
                                Reparamos sus<br />
                                electrodomésticos<br />
                                con <span className="text-accent-400">garantía profesional</span>
                            </h1>
                            <p className="text-base sm:text-body-lg text-gray-200 mt-4 sm:mt-6 animate-fadeInUp delay-100">
                                Más de 30 años de experiencia en reparación de licuadoras, aspiradoras, microondas y más.
                                Servicio rápido, confiable y a precios justos en toda Bogotá.
                            </p>
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-10 animate-fadeInUp delay-200">
                                <Link href="/contacto" className="btn-primary btn-lg">
                                    Solicitar Servicio
                                    <FiArrowRight className="ml-2" />
                                </Link>
                                <Link href="/servicios" className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                                    Ver Servicios
                                </Link>
                                <Link href="/tienda" className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
                                    <FiShoppingBag className="mr-2" />
                                    Ver Tienda
                                </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-6 sm:mt-10 text-sm sm:text-base text-gray-200 animate-fadeInUp delay-300">
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-accent-400" /> Garantía</span>
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-accent-400" /> Servicio rápido</span>
                                <span className="flex items-center gap-2"><FiCheckCircle className="text-accent-400" /> Precios justos</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="section" id="servicios">
                    <div className="text-center mb-14">
                        <h2 className="page-title">Nuestros Servicios</h2>
                        <p className="text-body-lg text-gray-500 max-w-2xl mx-auto">
                            Ofrecemos reparación profesional para todo tipo de electrodomésticos del hogar
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                img: '/services/licuadora.png',
                                title: 'Reparación de Licuadoras',
                                desc: 'Servicio técnico para licuadoras de todas las marcas. Diagnóstico profesional.',
                            },
                            {
                                img: '/services/aspiradora.png',
                                title: 'Reparación de Aspiradoras',
                                desc: 'Mantenimiento y reparación de aspiradoras. Optimizamos su potencia de succión.',
                            },
                            {
                                img: '/services/microondas.png',
                                title: 'Reparación de Microondas',
                                desc: 'Diagnóstico y reparación de hornos microondas. Cambio de magnetrón.',
                            },
                            {
                                img: '/services/airfryer.png',
                                title: 'Reparación de Air Fryers',
                                desc: 'Reparación de freidoras de aire. Mantenimiento del panel y resistencias.',
                            },
                            {
                                img: '/services/secador.png',
                                title: 'Reparación de Secadores de Pelo',
                                desc: 'Revisión y arreglo de secadores profesionales y de hogar.',
                            },
                            {
                                img: '/services/olla-presion.png',
                                title: 'Reparación de Ollas a Presión',
                                desc: 'Cambio de válvulas y empaques. Garantizamos la seguridad de sus ollas.',
                            },
                            {
                                img: '/services/olla-multiusos.png',
                                title: 'Reparación de Ollas Multiusos',
                                desc: 'Mantenimiento de ollas eléctricas y programables de todas las marcas.',
                            },
                            {
                                img: '/services/plancha.png',
                                title: 'Reparación de Planchas',
                                desc: 'Limpieza y reparación de planchas a vapor y convencionales.',
                            },
                            {
                                img: '/services/horno.png',
                                title: 'Reparación de Hornos',
                                desc: 'Hornos eléctricos convencionales. Servicio rápido y repuestos originales.',
                            },
                            {
                                img: '/services/sanduchera.png',
                                title: 'Reparación de Sanducheras',
                                desc: 'Arreglo de resistencias y cableado para sanducheras de todo tipo.',
                            },
                            {
                                img: '/services/kitchenaid.png',
                                title: 'Reparación de Batidoras KitchenAid',
                                desc: 'Servicio especializado y mantenimiento de batidoras KitchenAid.',
                            },
                            {
                                img: '',
                                title: 'Otros Electrodomésticos',
                                desc: '¿No ve su equipo en la lista? También reparamos una amplia variedad de electrodomésticos adicionales. Consúltenos.',
                                isOther: true,
                            },
                        ].map((service: any, i: number) => (
                            <div
                                key={i}
                                className={`card group hover:border-accent-200 animate-fadeInUp ${service.isOther ? 'bg-accent-50 border-accent-200' : ''}`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 bg-gray-50 flex-shrink-0 flex items-center justify-center">
                                    {service.isOther ? (
                                        <FiTool className="text-4xl text-accent-500" />
                                    ) : (
                                        <img
                                            src={service.img}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-primary-500 mb-3">{service.title}</h3>
                                <p className="text-gray-500 text-base leading-relaxed">{service.desc}</p>
                                <Link
                                    href="/contacto"
                                    className="inline-flex items-center gap-2 mt-4 text-accent-500 font-semibold 
                             hover:text-accent-600 transition-colors group-hover:translate-x-1 transition-transform"
                                >
                                    {service.isOther ? 'Consúltenos' : 'Solicitar reparación'} <FiArrowRight />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Us Section */}
                <section className="bg-gray-50 py-20">
                    <div className="section py-0">
                        <div className="text-center mb-14">
                            <h2 className="page-title">¿Por qué elegirnos?</h2>
                            <p className="text-body-lg text-gray-500 max-w-2xl mx-auto">
                                Somos su mejor opción para la reparación de electrodomésticos en Bogotá
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: <FiStar className="text-3xl" />, title: '+30 años', desc: 'De experiencia' },
                                { icon: <FiShield className="text-3xl" />, title: 'Garantía', desc: 'En todas las reparaciones' },
                                { icon: <FiClock className="text-3xl" />, title: 'Servicio rápido', desc: 'Diagnóstico el mismo día' },
                                { icon: <FiPhone className="text-3xl" />, title: 'Atención', desc: 'Personalizada y cercana' },
                            ].map((item, i) => (
                                <div key={i} className="stat-card border-none bg-white animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="w-16 h-16 bg-accent-50 text-accent-500 rounded-2xl flex items-center justify-center mb-4">
                                        {item.icon}
                                    </div>
                                    <div className="stat-number text-primary-500">{item.title}</div>
                                    <div className="stat-label">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-accent-500 text-white py-20">
                    <div className="section py-0 text-center">
                        <h2 className="text-xl sm:text-heading-lg text-white mb-4 break-words">¿Necesita reparar un electrodoméstico?</h2>
                        <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8">
                            Contáctenos hoy y reciba un diagnóstico profesional.
                            Servicio rápido y precios competitivos.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="tel:+573125846294" className="btn bg-white text-accent-600 hover:bg-gray-100 btn-lg font-bold">
                                <FiPhone className="mr-2 text-xl" /> Llamar Ahora
                            </a>
                            <Link href="/contacto" className="btn border-2 border-white text-white hover:bg-white/10 btn-lg">
                                Enviar Mensaje
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Store Preview */}
                <section className="section">
                    <div className="text-center mb-14">
                        <h2 className="page-title">Nuestra Tienda</h2>
                        <p className="text-body-lg text-gray-500 max-w-2xl mx-auto">
                            Repuestos, accesorios y electrodomésticos reacondicionados con garantía
                        </p>
                    </div>
                    <div className="text-center">
                        <Link href="/tienda" className="btn-primary btn-lg">
                            <FiShoppingBag className="mr-2" /> Visitar Tienda
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
