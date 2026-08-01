import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export const metadata = {
    title: 'Servicios de Reparación | Servimos Norte',
    description: 'Reparación profesional de licuadoras, aspiradoras, microondas, hornos y más en Bogotá.',
};

const services = [
    {
        img: '/services/licuadora.png',
        title: 'Reparación de Licuadoras',
        desc: 'Servicio técnico especializado para licuadoras de hogar y comerciales.',
        features: ['Revisión de motor', 'Cambio de cuchillas', 'Reparación de panel', 'Mantenimiento preventivo'],
    },
    {
        img: '/services/aspiradora.png',
        title: 'Reparación de Aspiradoras',
        desc: 'Mantenimiento y reparación de aspiradoras de todas las marcas y tamaños.',
        features: ['Limpieza de filtros', 'Reparación de motor', 'Cambio de cables', 'Recuperación de succión'],
    },
    {
        img: '/services/microondas.png',
        title: 'Reparación de Microondas',
        desc: 'Diagnóstico experto y reparación de hornos microondas averiados.',
        features: ['Cambio de magnetrón', 'Reparación de panel táctil', 'Revisión de fusibles', 'Limpieza profunda'],
    },
    {
        img: '/services/airfryer.png',
        title: 'Reparación de Air Fryers',
        desc: 'Arreglamos freidoras de aire (Air Fryers) de cualquier modelo o marca.',
        features: ['Revisión de resistencias', 'Reparación del termostato', 'Arreglo de temporizador', 'Diagnóstico general'],
    },
    {
        img: '/services/secador.png',
        title: 'Reparación de Secadores de Pelo',
        desc: 'Servicio técnico para secadores de pelo profesionales y de uso personal.',
        features: ['Revisión de resistencia', 'Mantenimiento de motor', 'Cambio de cable', 'Limpieza del filtro'],
    },
    {
        img: '/services/olla-presion.png',
        title: 'Reparación de Ollas a Presión',
        desc: 'Servicio completo para dejar sus ollas a presión como nuevas y totalmente seguras.',
        features: ['Cambio de válvulas', 'Reemplazo de empaques', 'Ajuste de mangos', 'Revisión de seguridad'],
    },
    {
        img: '/services/olla-multiusos.png',
        title: 'Reparación de Ollas Multiusos',
        desc: 'Reparamos ollas eléctricas y programables multiusos.',
        features: ['Diagnóstico electrónico', 'Reparación de sensores', 'Revisión del panel', 'Mantenimiento correctivo'],
    },
    {
        img: '/services/plancha.png',
        title: 'Reparación de Planchas',
        desc: 'Extendemos la vida útil de sus planchas tradicionales y a vapor.',
        features: ['Destapado de conductos', 'Reparación del termostato', 'Cambio de cable', 'Limpieza general'],
    },
    {
        img: '/services/horno.png',
        title: 'Reparación de Hornos',
        desc: 'Reparación experta de hornos eléctricos convencionales para el hogar.',
        features: ['Cambio de resistencia', 'Reparación de puerta', 'Arreglo de controles', 'Diagnóstico térmico'],
    },
    {
        img: '/services/sanduchera.png',
        title: 'Reparación de Sanducheras',
        desc: 'Arreglamos fallas en sanducheras y wafleras rápidamente.',
        features: ['Revisión de placas', 'Reparación de resistencias', 'Cambio de termostato', 'Ajustes eléctricos'],
    },
    {
        img: '/services/kitchenaid.png',
        title: 'Reparación de Batidoras KitchenAid',
        desc: 'Servicio técnico altamente especializado exclusivo para batidoras KitchenAid.',
        features: ['Revisión de engranajes', 'Mantenimiento de motor', 'Engrase profesional', 'Repuestos originales'],
    },
];

export default function ServiciosPage() {
    return (
        <>
            <Navbar />
            <main>
                {/* Header */}
                <section className="relative bg-primary-500 text-white py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/headers/header-servicios.png')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/70 to-primary-500/50"></div>
                    <div className="absolute right-0 sm:right-20 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                        <img src="/logo.png" alt="Servimos Norte" className="w-64 sm:w-96 object-contain" />
                    </div>
                    <div className="section py-0 relative z-10">
                        <h1 className="text-2xl sm:text-heading-xl text-white mb-4 animate-fadeInUp break-words">Nuestros Servicios</h1>
                        <p className="text-base sm:text-xl text-gray-200 max-w-3xl animate-fadeInUp delay-100">
                            Ofrecemos servicio técnico profesional para todo tipo de electrodomésticos.
                            Más de 30 años de experiencia nos respaldan.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="section">
                    <div className="space-y-12">
                        {services.map((service, i) => (
                            <div
                                key={i}
                                className="card p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-start animate-fadeInUp"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                    <img src={service.img} alt={service.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-primary-500 mb-3">{service.title}</h2>
                                    <p className="text-gray-500 text-body mb-6">{service.desc}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {service.features.map((feature, j) => (
                                            <div key={j} className="flex items-center gap-2 text-gray-600">
                                                <FiCheckCircle className="text-accent-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:self-center">
                                    <Link href="/contacto" className="btn-primary whitespace-nowrap">
                                        Solicitar <FiArrowRight className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Otros Electrodomésticos */}
                <section className="section py-0 mb-20 text-center animate-fadeInUp">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col items-center justify-center gap-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary-500 m-0">
                                Reparaciones de Otros Electrodomésticos
                            </h2>
                            <p className="text-base sm:text-xl text-gray-600 max-w-2xl">
                                ¿No ve su equipo en la lista anterior? También reparamos una amplia variedad de electrodomésticos adicionales.
                            </p>
                            <Link href="/contacto" className="btn-primary whitespace-nowrap">
                                Consúltenos <FiArrowRight className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-accent-500 text-white py-16">
                    <div className="section py-0 text-center">
                        <h2 className="text-xl sm:text-heading-lg text-white mb-4 break-words">¿Listo para reparar su electrodoméstico?</h2>
                        <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
                            Contáctenos y reciba un presupuesto sin compromiso.
                        </p>
                        <Link href="/contacto" className="btn bg-white text-accent-600 hover:bg-gray-100 btn-lg font-bold">
                            Contactar Ahora
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
