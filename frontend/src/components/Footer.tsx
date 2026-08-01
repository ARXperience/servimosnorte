import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="bg-primary-500 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-extrabold text-xl">SN</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold">Servimos Norte</span>
                            </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed">
                            Más de 30 años reparando electrodomésticos en Bogotá.
                            Servicio profesional, rápido y confiable.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Navegación</h3>
                        <ul className="space-y-3">
                            {[
                                { href: '/', label: 'Inicio' },
                                { href: '/servicios', label: 'Servicios' },
                                { href: '/tienda', label: 'Tienda' },
                                { href: '/nosotros', label: 'Nosotros' },
                                { href: '/contacto', label: 'Contacto' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-gray-300 hover:text-accent-400 transition-colors text-base">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Servicios</h3>
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-gray-300 font-medium hover:text-accent-400">
                                Ver todos los servicios
                                <span className="transition-transform group-open:rotate-180">
                                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <ul className="space-y-3 text-gray-300 text-base mt-4 pl-3 border-l-2 border-primary-400">
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Licuadoras</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Aspiradoras</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Microondas</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Air Fryers</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Secadores de Pelo</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Ollas a Presión</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Ollas Multiusos</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Planchas</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Hornos</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Sanducheras</Link></li>
                                <li><Link href="/servicios" className="hover:text-accent-400 transition-colors block">Reparación de Batidoras KitchenAid</Link></li>
                            </ul>
                        </details>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Contacto</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-300">
                                <FiPhone className="text-accent-400 text-xl mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Teléfono</p>
                                    <a href="tel:+573125846294" className="hover:text-accent-400 transition-colors">
                                        312 584 6294
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <FiMail className="text-accent-400 text-xl mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Correo</p>
                                    <span>servimosnorte@gmail.com</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <FiMapPin className="text-accent-400 text-xl mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Dirección</p>
                                    <span>Cl. 142 #17 A -5, Local 2, Usaquén, Bogotá</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <FiClock className="text-accent-400 text-xl mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Horario</p>
                                    <span>Lun - Jue: 9am - 7pm<br/>Vie: 9am - 6pm<br/>Sáb: 9am - 2pm</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-primary-400 mt-12 pt-8 text-center text-gray-400 text-sm flex flex-col sm:flex-row justify-center items-center gap-4">
                    <p>© {new Date().getFullYear()} Servimos Norte. Todos los derechos reservados.</p>
                    <div className="flex gap-4">
                        <Link href="/terminos" className="hover:text-accent-400 transition-colors">Términos y Condiciones</Link>
                        <Link href="/politica-de-reembolso" className="hover:text-accent-400 transition-colors">Política de Reembolso</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
