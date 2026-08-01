'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ReportesPage() {
    const [report, setReport] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => { loadReport(); }, []);

    const loadReport = async () => {
        setLoading(true);
        try {
            const [reportData, statsData] = await Promise.all([
                api.getAccountingReport(startDate, endDate),
                api.getDashboardStats(),
            ]);
            setReport(reportData);
            setStats(statsData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleExportCSV = async () => {
        try {
            const csv = await api.exportCSV(startDate, endDate);
            const blob = new Blob([csv as string], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_servimos_${startDate}_${endDate}.csv`;
            a.click();
            toast.success('CSV descargado');
        } catch (err: any) { toast.error(err.message); }
    };

    const formatCurrency = (a: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(a || 0);

    const totalRevenue = report.reduce((sum, r) => sum + Number(r.monto), 0);
    const repairTotal = report.filter((r) => r.tipo === 'Reparación').reduce((sum, r) => sum + Number(r.monto), 0);
    const salesTotal = report.filter((r) => r.tipo === 'Venta').reduce((sum, r) => sum + Number(r.monto), 0);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                    <h2 className="text-heading text-primary-500">Reportes Contables</h2>
                    <p className="text-gray-500">Ingresos y exportaciones</p>
                </div>
                <button onClick={handleExportCSV} className="btn-primary btn-sm">
                    <FiDownload className="mr-2" /> Exportar CSV
                </button>
            </div>

            {/* Date Filter */}
            <div className="card p-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="label"><FiCalendar className="inline mr-1" /> Desde</label>
                        <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="label"><FiCalendar className="inline mr-1" /> Hasta</label>
                        <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button onClick={loadReport} className="btn-secondary btn-sm">Consultar</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="stat-card border-l-4 border-accent-500">
                    <div className="stat-number">{formatCurrency(totalRevenue)}</div>
                    <div className="stat-label">Total Ingresos</div>
                </div>
                <div className="stat-card border-l-4 border-blue-500">
                    <div className="stat-number text-blue-500">{formatCurrency(repairTotal)}</div>
                    <div className="stat-label">Reparaciones</div>
                </div>
                <div className="stat-card border-l-4 border-green-500">
                    <div className="stat-number text-green-500">{formatCurrency(salesTotal)}</div>
                    <div className="stat-label">Ventas</div>
                </div>
            </div>

            {/* Report Table */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Fecha</th><th>Tipo</th><th>Método</th><th>Monto</th><th>Descripción</th></tr>
                        </thead>
                        <tbody>
                            {report.map((r: any) => (
                                <tr key={r.id}>
                                    <td className="text-sm">{new Date(r.fecha).toLocaleDateString('es-CO')}</td>
                                    <td>
                                        <span className={`badge ${r.tipo === 'Reparación' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {r.tipo}
                                        </span>
                                    </td>
                                    <td className="text-sm">{r.metodo}</td>
                                    <td className="font-bold text-accent-500">{formatCurrency(Number(r.monto))}</td>
                                    <td className="text-sm text-gray-400 max-w-xs truncate">{r.descripcion || '—'}</td>
                                </tr>
                            ))}
                            {report.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No hay datos en este período</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
