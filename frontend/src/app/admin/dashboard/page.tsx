'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiTool, FiShoppingBag, FiEye, FiClock, FiArrowUpRight } from 'react-icons/fi';
import VisitorAnalytics from '@/components/VisitorAnalytics';

const REPAIR_STATES = [
    { key: 'PENDING', label: 'Pendientes', dot: 'bg-amber-400' },
    { key: 'ACCEPTED', label: 'Aceptadas', dot: 'bg-sky-400' },
    { key: 'IN_PROGRESS', label: 'En progreso', dot: 'bg-violet-400' },
    { key: 'COMPLETED', label: 'Completadas', dot: 'bg-accent-500' },
    { key: 'DELIVERED', label: 'Entregadas', dot: 'bg-teal-400' },
    { key: 'REJECTED', label: 'Rechazadas', dot: 'bg-rose-400' },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [repairStats, setRepairStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [dashStats, repStats] = await Promise.all([
                api.getDashboardStats(),
                api.getRepairStats(),
            ]);
            setStats(dashStats);
            setRepairStats(repStats);
        } catch (err) {
            console.error('Error loading dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount || 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-accent-500 rounded-full animate-spin" />
            </div>
        );
    }

    const monthLabelRaw = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    const monthLabel = monthLabelRaw.charAt(0).toUpperCase() + monthLabelRaw.slice(1);
    const revenue = stats?.monthlyRevenue || 0;
    const repairShare = revenue > 0 ? (stats?.repairIncome / revenue) * 100 : 0;
    const salesShare = revenue > 0 ? (stats?.productSales / revenue) * 100 : 0;
    const totalRepairStates = REPAIR_STATES.reduce((acc, s) => acc + (repairStats?.[s.key] || 0), 0);

    const kpis = [
        { label: 'Reparaciones', value: stats?.totalRepairs || 0, caption: 'registradas en el sistema', icon: <FiTool /> },
        { label: 'Órdenes de tienda', value: stats?.totalOrders || 0, caption: 'pedidos acumulados', icon: <FiShoppingBag /> },
        { label: 'Visitas a la web', value: stats?.totalVisits || 0, caption: 'histórico total', icon: <FiEye /> },
        { label: 'Pagos pendientes', value: stats?.pendingCount || 0, caption: formatCurrency(stats?.pendingTotal), icon: <FiClock /> },
    ];

    return (
        <div className="space-y-6 animate-fadeIn max-w-[1200px] mx-auto">
            {/* Encabezado */}
            <div className="flex items-end justify-between flex-wrap gap-2">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-1">
                        Panel general
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-primary-500">Servimos Norte</h2>
                </div>
                <p className="text-sm text-gray-400">{monthLabel}</p>
            </div>

            {/* Hero: ingresos del mes */}
            <section className="relative overflow-hidden rounded-3xl bg-primary-500 text-white">
                <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                        background:
                            'radial-gradient(ellipse 60% 80% at 85% 10%, rgba(76,175,80,0.25), transparent 60%), radial-gradient(ellipse 50% 70% at 10% 100%, rgba(90,121,171,0.25), transparent 60%)',
                    }}
                />
                <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 p-7 sm:p-9">
                    <div className="lg:col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">
                            Ingresos del mes
                        </p>
                        <p className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums">
                            {formatCurrency(revenue)}
                        </p>
                        <p className="text-sm text-white/50 mt-2">{monthLabel}</p>
                    </div>

                    <div className="lg:col-span-2 flex flex-col justify-center gap-5">
                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-white/70">Reparaciones</span>
                                <span className="font-semibold tabular-nums">{formatCurrency(stats?.repairIncome)}</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-accent-400" style={{ width: `${repairShare}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-white/70">Ventas de productos</span>
                                <span className="font-semibold tabular-nums">{formatCurrency(stats?.productSales)}</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-sky-400" style={{ width: `${salesShare}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 lg:border-l border-white/10 pt-5 lg:pt-0 lg:pl-8">
                        <div className="lg:text-right">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-1">
                                Por cobrar
                            </p>
                            <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats?.pendingTotal)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 rounded-full px-3 py-1.5">
                            <FiArrowUpRight />
                            {stats?.pendingCount || 0} pagos pendientes
                        </span>
                    </div>
                </div>
            </section>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="bg-white rounded-2xl border border-gray-100 p-5 transition-colors hover:border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                                {kpi.label}
                            </p>
                            <span className="text-gray-300">{kpi.icon}</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-primary-500 tabular-nums">{kpi.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{kpi.caption}</p>
                    </div>
                ))}
            </div>

            {/* Estado de reparaciones */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                        Estado de reparaciones
                    </p>
                    <p className="text-xs text-gray-400">{totalRepairStates} en total</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-5">
                    {REPAIR_STATES.map((s) => {
                        const count = repairStats?.[s.key] || 0;
                        const share = totalRepairStates > 0 ? (count / totalRepairStates) * 100 : 0;
                        return (
                            <div key={s.key}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    <span className="text-sm text-gray-500">{s.label}</span>
                                </div>
                                <p className="text-2xl font-bold tracking-tight text-primary-500 tabular-nums">{count}</p>
                                <div className="h-0.5 mt-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${share}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Analítica de visitantes */}
            <VisitorAnalytics />
        </div>
    );
}
