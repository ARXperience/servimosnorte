import Link from 'next/link';

export default function PageHeader({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
    return (
        <section className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
            <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl bg-primary-500 text-white">
                {image && <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-500/80 to-primary-500/10" />
                <div className="relative px-6 py-12 sm:px-12 sm:py-20 lg:py-24 animate-fadeInUp">
                    <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
                        <Link href="/" className="inline-flex items-center hover:text-white transition-colors">Inicio</Link>
                        <span>/</span>
                        <span className="text-accent-300 font-semibold">{title}</span>
                    </nav>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white max-w-3xl">{title}</h1>
                    {subtitle && <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">{subtitle}</p>}
                </div>
            </div>
        </section>
    );
}
