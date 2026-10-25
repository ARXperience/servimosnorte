import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { FiCheckCircle, FiArrowRight, FiTool, FiPhone } from 'react-icons/fi';

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
                <PageHeader
                    title="Nuestros Servicios"
                    subtitle="Ofrecemos servicio técnico profesional para todo tipo de electrodomésticos. Más de 30 años de experiencia nos respaldan."
                    image="/images/headers/header-servicios.png"
                />

                {/* Services Grid */}
                <section className="section">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {services.map((service) => (
                            <div
                                key={service.title}
                                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-[5/4] bg-white overflow-hidden">
                                    <img src={service.img} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 flex flex-col p-5 sm:p-6 border-t border-gray-50">
                                    <h2 className="text-xl font-bold text-primary-500 mb-2">{service.title}</h2>
                                    <p className="text-gray-500 text-[15px] leading-relaxed mb-4">{service.desc}</p>
                                    <ul className="grid grid-cols-1 gap-2 mb-6">
                                        {service.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                                <FiCheckCircle className="text-accent-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/contacto" className="mt-auto inline-flex items-center gap-2 font-semibold text-accent-600 hover:text-accent-700 group-hover:gap-3 transition-all">
                                        Solicitar <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* Otros Electrodomésticos */}
                        <div className="rounded-2xl bg-primary-500 text-white p-6 sm:p-8 flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                <FiTool className="text-2xl text-accent-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Reparaciones de Otros Electrodomésticos</h2>
                            <p className="text-white/70 text-[15px] leading-relaxed mb-6">
                                ¿No ve su equipo en la lista anterior? También reparamos una amplia variedad de electrodomésticos adicionales.
                            </p>
                            <Link href="/contacto" className="btn-primary mt-auto self-start">
                                Consúltenos <FiArrowRight className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="section pt-0">
                    <div className="relative overflow-hidden rounded-3xl bg-accent-500 px-6 py-12 sm:px-12 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/15 rounded-full blur-3xl" />
                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">¿Listo para reparar su electrodoméstico?</h2>
                            <p className="text-white/85 mt-2">Contáctenos y reciba un presupuesto sin compromiso.</p>
                        </div>
                        <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
                            <Link href="/contacto" className="btn btn-lg bg-white text-accent-700 hover:bg-gray-100 font-bold">
                                Contactar Ahora
                            </Link>
                            <a href="tel:+573125846294" className="btn btn-lg border border-white/50 text-white hover:bg-white/10">
                                <FiPhone className="mr-2" /> Llamar
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
