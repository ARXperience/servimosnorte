import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiShield, FiHeart, FiAward, FiUsers } from 'react-icons/fi';

export const metadata = {
    title: 'Nosotros | Servimos Norte',
    description: 'Conozca a Servimos Norte, su servicio técnico de confianza en Bogotá con más de 30 años de experiencia.',
};

export default function NosotrosPage() {
    return (
        <>
            <Navbar />
            <main>
                <section className="relative bg-primary-500 text-white py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/headers/header-nosotros.png')] bg-cover bg-center opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/70 to-primary-500/50"></div>
                    <div className="absolute right-0 sm:right-20 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                        <img src="/logo.png" alt="Servimos Norte" className="w-64 sm:w-96 object-contain" />
                    </div>
                    <div className="section py-0 relative z-10">
                        <h1 className="text-2xl sm:text-heading-xl text-white mb-4 animate-fadeInUp break-words">Sobre Nosotros</h1>
                        <p className="text-base sm:text-xl text-gray-200 max-w-3xl animate-fadeInUp delay-100">
                            Somos una empresa familiar dedicada a la reparación de electrodomésticos en Bogotá.
                        </p>
                    </div>
                </section>

                <section className="section">
                    <div className="max-w-4xl mx-auto">
                        <div className="card p-10 mb-10 animate-fadeInUp">
                            <h2 className="text-2xl font-bold text-primary-500 mb-6">Nuestra Historia</h2>
                            <p className="text-body text-gray-600 leading-relaxed mb-4">
                                Servimos Norte nació hace más de 30 años en el norte de Bogotá con un propósito claro:
                                ofrecer un servicio técnico de calidad, honesto y accesible para todos los hogares colombianos.
                            </p>
                            <p className="text-body text-gray-600 leading-relaxed mb-4">
                                Lo que comenzó como un pequeño taller, hoy se ha convertido en un centro de servicio técnico
                                completo que atiende licuadoras, aspiradoras, microondas, air fryers, secadores de pelo, ollas a presión, ollas multiusos, planchas, hornos, sanducheras y batidoras KitchenAid.
                            </p>
                            <p className="text-body text-gray-600 leading-relaxed">
                                Nuestro compromiso siempre ha sido y será brindar un servicio transparente, con precios justos
                                y garantía real en cada reparación que realizamos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                            <div className="card p-8 text-center animate-fadeInUp delay-100">
                                <div className="w-16 h-16 bg-accent-50 text-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiHeart className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-500 mb-2">Misión</h3>
                                <p className="text-gray-500">
                                    Ofrecer soluciones confiables y accesibles para la reparación de electrodomésticos,
                                    generando confianza y satisfacción en cada cliente.
                                </p>
                            </div>
                            <div className="card p-8 text-center animate-fadeInUp delay-200">
                                <div className="w-16 h-16 bg-accent-50 text-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiAward className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-primary-500 mb-2">Visión</h3>
                                <p className="text-gray-500">
                                    Ser el servicio técnico de electrodomésticos más reconocido y confiable de Bogotá,
                                    destacados por nuestra calidad y atención al cliente.
                                </p>
                            </div>
                        </div>

                        <div className="card p-10 animate-fadeInUp delay-300">
                            <h2 className="text-2xl font-bold text-primary-500 mb-6">Nuestros Valores</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { icon: <FiShield />, title: 'Honestidad', desc: 'Precios transparentes sin costos ocultos' },
                                    { icon: <FiAward />, title: 'Calidad', desc: 'Trabajo profesional con garantía real' },
                                    { icon: <FiUsers />, title: 'Cercanía', desc: 'Trato personalizado y cercano' },
                                    { icon: <FiHeart />, title: 'Compromiso', desc: 'Cumplimos con lo que prometemos' },
                                ].map((v, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-accent-50 text-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                                            {v.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary-500">{v.title}</h4>
                                            <p className="text-gray-500 text-sm">{v.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
