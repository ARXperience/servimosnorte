'use client';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { api } from '@/lib/api';
import {
    FiUsers, FiClock, FiEye, FiGlobe, FiSmartphone,
    FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiMapPin, FiRefreshCw,
} from 'react-icons/fi';

const PAGE_SIZE = 20;

type Preset = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

const toDateInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const presetRange = (preset: Preset): { start: string; end: string } => {
    const now = new Date();
    const end = toDateInput(now);
    if (preset === 'today') return { start: end, end };
    if (preset === '7d') {
        const d = new Date(); d.setDate(d.getDate() - 6);
        return { start: toDateInput(d), end };
    }
    if (preset === 'month') return { start: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)), end };
    if (preset === 'year') return { start: toDateInput(new Date(now.getFullYear(), 0, 1)), end };
    const d = new Date(); d.setDate(d.getDate() - 29);
    return { start: toDateInput(d), end };
};

const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 1) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatSeriesLabel = (key: string, groupBy: string) => {
    if (!key) return '';
    if (groupBy === 'month') {
        const [y, m] = key.split('-');
        const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${names[parseInt(m, 10) - 1]} ${y}`;
    }
    const [, m, d] = key.split('-');
    return `${d}/${m}`;
};

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400';
const panel = 'bg-white rounded-2xl border border-gray-100';
const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-accent-500 transition-colors';

export default function VisitorAnalytics() {
    const [preset, setPreset] = useState<Preset>('30d');
    const [range, setRange] = useState(presetRange('30d'));
    const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');
    const [device, setDevice] = useState('');
    const [country, setCountry] = useState('');
    const [path, setPath] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [stats, setStats] = useState<any>(null);
    const [visitors, setVisitors] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const applyPreset = (p: Preset) => {
        setPreset(p);
        if (p !== 'custom') {
            setRange(presetRange(p));
            setGroupBy(p === 'year' ? 'month' : 'day');
        }
        setPage(1);
    };

    const queryDates = useMemo(() => ({
        start: new Date(`${range.start}T00:00:00`).toISOString(),
        end: new Date(`${range.end}T23:59:59.999`).toISOString(),
    }), [range]);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const tzOffset = String(new Date().getTimezoneOffset());
                const common: Record<string, string> = { start: queryDates.start, end: queryDates.end };
                if (device) common.device = device;
                if (country) common.country = country;
                if (path) common.path = path;
                if (search) common.search = search;

                const [statsRes, visitorsRes] = await Promise.all([
                    api.getVisitorStats({ start: queryDates.start, end: queryDates.end, groupBy, tzOffset }),
                    api.getVisitors({ ...common, page: String(page), limit: String(PAGE_SIZE) }),
                ]);
                if (!cancelled) {
                    setStats(statsRes);
                    setVisitors(visitorsRes);
                }
            } catch {
                // silencioso: el dashboard principal ya muestra errores
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 350);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [queryDates, groupBy, device, country, path, search, page]);

    const countryOptions = useMemo(
        () => Object.keys(stats?.byCountry || {}).filter((c) => c !== 'Desconocido').sort(),
        [stats],
    );
    const pathOptions = useMemo(
        () => (stats?.topPages || []).map((p: any) => p.path),
        [stats],
    );

    const totalPages = Math.max(1, Math.ceil((visitors?.total || 0) / PAGE_SIZE));
    const maxSeries = Math.max(...(stats?.series || []).map((s: any) => s.total), 1);
    const isOnline = (lastSeenAt: string) => Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000;

    const summary = [
        { label: 'Visitas', value: stats?.totalVisits ?? 0, caption: 'en el período', icon: <FiEye /> },
        { label: 'Visitantes únicos', value: stats?.uniqueVisitors ?? 0, caption: 'por dirección IP', icon: <FiUsers /> },
        { label: 'Duración media', value: formatDuration(stats?.avgDurationSeconds || 0), caption: 'por visita', icon: <FiClock /> },
        { label: 'Páginas por visita', value: stats?.avgPagesPerSession ?? 0, caption: `${stats?.totalPageViews ?? 0} páginas vistas`, icon: <FiGlobe /> },
    ];

    const breakdown = (title: string, data: Record<string, number>, icon: JSX.Element) => {
        const entries = Object.entries(data || {}).sort(([, a], [, b]) => b - a).slice(0, 6);
        const max = Math.max(...entries.map(([, v]) => v), 1);
        return (
            <div className={`${panel} p-5`}>
                <p className={`${eyebrow} mb-4 flex items-center gap-2`}>{icon}{title}</p>
                {entries.length === 0 && <p className="text-sm text-gray-400">Sin datos</p>}
                <div className="space-y-3">
                    {entries.map(([label, count]) => (
                        <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 truncate">{label}</span>
                                <span className="font-semibold text-primary-500 tabular-nums">{count}</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-500 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-end justify-between flex-wrap gap-2">
                <div>
                    <p className={`${eyebrow} mb-1`}>Analítica web</p>
                    <h3 className="text-xl font-bold tracking-tight text-primary-500">Registro de visitantes</h3>
                </div>
                {loading && <FiRefreshCw className="animate-spin text-accent-500 text-lg mb-1" />}
            </div>

            {/* Filtros */}
            <div className={`${panel} p-4 space-y-4`}>
                <div className="flex flex-wrap items-center gap-2">
                    {([
                        ['today', 'Hoy'], ['7d', '7 días'], ['30d', '30 días'],
                        ['month', 'Este mes'], ['year', 'Este año'],
                    ] as [Preset, string][]).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => applyPreset(key)}
                            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${preset === key
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                        >
                            {label}
                        </button>
                    ))}
                    <div className="flex items-center ml-auto bg-gray-100 rounded-full p-0.5">
                        {([['day', 'Días'], ['month', 'Meses']] as ['day' | 'month', string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setGroupBy(key)}
                                className={`px-3.5 py-1 rounded-full text-sm font-medium transition-colors ${groupBy === key ? 'bg-white shadow-sm text-primary-500' : 'text-gray-400'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Desde</label>
                        <input
                            type="date"
                            value={range.start}
                            max={range.end}
                            onChange={(e) => { setRange({ ...range, start: e.target.value }); setPreset('custom'); setPage(1); }}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Hasta</label>
                        <input
                            type="date"
                            value={range.end}
                            min={range.start}
                            onChange={(e) => { setRange({ ...range, end: e.target.value }); setPreset('custom'); setPage(1); }}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Dispositivo</label>
                        <select value={device} onChange={(e) => { setDevice(e.target.value); setPage(1); }} className={inputCls}>
                            <option value="">Todos</option>
                            <option value="Móvil">Móvil</option>
                            <option value="Escritorio">Escritorio</option>
                            <option value="Tableta">Tableta</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">País</label>
                        <select value={country} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className={inputCls}>
                            <option value="">Todos</option>
                            {countryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Página visitada</label>
                        <select value={path} onChange={(e) => { setPath(e.target.value); setPage(1); }} className={inputCls}>
                            <option value="">Todas</option>
                            {pathOptions.map((p: string) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Buscar IP</label>
                        <input
                            type="text"
                            value={search}
                            placeholder="Ej: 181.49"
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.map((item) => (
                    <div key={item.label} className={`${panel} p-5 transition-colors hover:border-gray-200`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className={eyebrow}>{item.label}</p>
                            <span className="text-gray-300">{item.icon}</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-primary-500 tabular-nums">{item.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.caption}</p>
                    </div>
                ))}
            </div>

            {/* Gráfica */}
            {stats?.series && stats.series.length > 0 && (
                <div className={`${panel} p-6`}>
                    <p className={`${eyebrow} mb-5`}>
                        Visitas {groupBy === 'month' ? 'por mes' : 'por día'}
                    </p>
                    <div className="relative h-52 w-full flex items-end gap-[3px]">
                        {stats.series.map((item: any) => (
                            <div key={item.key} className="flex-1 min-w-[6px] flex flex-col items-center justify-end h-full group relative">
                                <div
                                    className={`w-full max-w-[26px] mx-auto rounded-full transition-colors ${item.total > 0 ? 'bg-accent-500/70 group-hover:bg-accent-500' : 'bg-gray-100'}`}
                                    style={{ height: item.total > 0 ? `${Math.max((item.total / maxSeries) * 100, 3)}%` : '3px' }}
                                />
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-primary-500 text-white text-xs py-1.5 px-2.5 rounded-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                                    {formatSeriesLabel(item.key, groupBy)} · {item.total} visitas
                                    {item.uniqueVisitors > 0 && ` · ${item.uniqueVisitors} únicos`}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                        <span>{formatSeriesLabel(stats.series[0]?.key, groupBy)}</span>
                        <span>{formatSeriesLabel(stats.series[stats.series.length - 1]?.key, groupBy)}</span>
                    </div>
                </div>
            )}

            {/* Top páginas y desgloses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${panel} p-5`}>
                    <p className={`${eyebrow} mb-4 flex items-center gap-2`}><FiEye />Páginas más visitadas</p>
                    {(!stats?.topPages || stats.topPages.length === 0) && (
                        <p className="text-sm text-gray-400">Sin datos en este período</p>
                    )}
                    <div className="divide-y divide-gray-50">
                        {(stats?.topPages || []).slice(0, 8).map((p: any) => (
                            <div key={p.path} className="flex items-center justify-between py-2.5 text-sm">
                                <span className="text-gray-700 font-medium truncate mr-2">{p.path}</span>
                                <span className="text-gray-400 whitespace-nowrap tabular-nums">
                                    {p.views} vistas · {formatDuration(p.avgSeconds)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {breakdown('Dispositivos', stats?.byDevice, <FiSmartphone />)}
                    {breakdown('Países', stats?.byCountry, <FiMapPin />)}
                </div>
            </div>

            {/* Tabla de sesiones */}
            <div className={`${panel} overflow-hidden`}>
                <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-2">
                    <p className={eyebrow}>Detalle de visitas</p>
                    <span className="text-xs text-gray-400 tabular-nums">{visitors?.total || 0} sesiones</span>
                </div>

                {(!visitors?.sessions || visitors.sessions.length === 0) ? (
                    <p className="text-sm text-gray-400 px-5 pb-5">
                        Aún no hay visitas registradas con este nivel de detalle en el período seleccionado.
                        Los nuevos visitantes de la web se registrarán automáticamente a partir de ahora.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-gray-400 border-y border-gray-50 bg-gray-50/50 [&>th]:whitespace-nowrap">
                                    <th className="px-5 py-2.5 font-semibold"></th>
                                    <th className="px-3 py-2.5 font-semibold">Entrada</th>
                                    <th className="px-3 py-2.5 font-semibold">Salida</th>
                                    <th className="px-3 py-2.5 font-semibold">Duración</th>
                                    <th className="px-3 py-2.5 font-semibold">IP</th>
                                    <th className="px-3 py-2.5 font-semibold">Ubicación</th>
                                    <th className="px-3 py-2.5 font-semibold">Dispositivo</th>
                                    <th className="px-3 py-2.5 font-semibold text-center">Páginas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitors.sessions.map((s: any) => (
                                    <Fragment key={s.id}>
                                        <tr
                                            onClick={() => setExpanded({ ...expanded, [s.id]: !expanded[s.id] })}
                                            className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors"
                                        >
                                            <td className="px-5 py-3 text-gray-300">
                                                {expanded[s.id] ? <FiChevronUp /> : <FiChevronDown />}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                                                {formatDateTime(s.startedAt)}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                                                {isOnline(s.lastSeenAt) ? (
                                                    <span className="inline-flex items-center gap-1.5 text-accent-600 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                                                        En línea
                                                    </span>
                                                ) : (
                                                    s.lastSeenAt ? formatTime(s.lastSeenAt) : '—'
                                                )}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap font-semibold text-primary-500 tabular-nums">
                                                {formatDuration(s.durationSeconds)}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
                                                {s.ip || '—'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                                                {[s.city, s.country].filter(Boolean).join(', ') || '—'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                                                {s.device} · {s.browser}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="inline-block min-w-[28px] bg-gray-100 text-primary-500 text-xs font-semibold rounded-full px-2 py-0.5 tabular-nums">
                                                    {s.pageViews?.length || 0}
                                                </span>
                                            </td>
                                        </tr>
                                        {expanded[s.id] && (
                                            <tr className="bg-gray-50/40 border-b border-gray-50">
                                                <td colSpan={8} className="px-5 py-4">
                                                    <div className="text-xs text-gray-400 mb-3 flex flex-wrap gap-x-5 gap-y-1">
                                                        <span><b className="text-gray-500">Sistema:</b> {s.os}</span>
                                                        {s.referrer && <span><b className="text-gray-500">Origen:</b> {s.referrer}</span>}
                                                        {s.language && <span><b className="text-gray-500">Idioma:</b> {s.language}</span>}
                                                        {s.screen && <span><b className="text-gray-500">Pantalla:</b> {s.screen}</span>}
                                                        {s.region && <span><b className="text-gray-500">Región:</b> {s.region}</span>}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {(s.pageViews || []).map((pv: any, i: number) => (
                                                            <div key={pv.id} className="flex items-center gap-3 text-sm">
                                                                <span className="w-5 text-right text-gray-300 tabular-nums">{i + 1}</span>
                                                                <span className="font-medium text-primary-500 min-w-[140px]">{pv.path}</span>
                                                                <span className="text-gray-400">entró {formatTime(pv.enteredAt)}</span>
                                                                <span className="text-gray-400">· estuvo {formatDuration(pv.durationSeconds)}</span>
                                                            </div>
                                                        ))}
                                                        {(!s.pageViews || s.pageViews.length === 0) && (
                                                            <span className="text-sm text-gray-400">Sin navegación registrada</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-500 disabled:opacity-30 hover:text-primary-500 transition-colors"
                        >
                            <FiChevronLeft /> Anterior
                        </button>
                        <span className="text-xs text-gray-400 tabular-nums">Página {page} de {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-500 disabled:opacity-30 hover:text-primary-500 transition-colors"
                        >
                            Siguiente <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
