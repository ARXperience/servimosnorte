import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Request } from 'express';
import { Payment, PaymentStatusEnum } from '../payments/entities/payment.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Order } from '../orders/entities/order.entity';
import { SiteVisit } from './entities/site-visit.entity';
import { VisitorSession, PageView } from './entities/visitor-session.entity';
import { StartSessionDto, PageViewDto, HeartbeatDto } from './dto/visit.dto';

export interface VisitorFilters {
    start: Date;
    end: Date;
    country?: string;
    device?: string;
    path?: string;
    search?: string;
    page: number;
    limit: number;
}

@Injectable()
export class AccountingService {
    constructor(
        @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
        @InjectRepository(Repair) private repairRepo: Repository<Repair>,
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(SiteVisit) private visitRepo: Repository<SiteVisit>,
        @InjectRepository(VisitorSession) private sessionRepo: Repository<VisitorSession>,
        @InjectRepository(PageView) private pageViewRepo: Repository<PageView>,
    ) { }

    async recordVisit() {
        const visit = this.visitRepo.create();
        await this.visitRepo.save(visit);
        return { success: true };
    }

    // ==================== Tracking detallado de visitantes ====================

    private getClientIp(req: Request): string {
        const fwd = req.headers['x-forwarded-for'];
        const raw = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim()
            || req.socket?.remoteAddress
            || '';
        return raw.replace(/^::ffff:/, '');
    }

    private isPrivateIp(ip: string): boolean {
        return !ip
            || ip === '::1'
            || ip.startsWith('127.')
            || ip.startsWith('10.')
            || ip.startsWith('192.168.')
            || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
    }

    private parseUserAgent(ua: string) {
        const s = ua || '';
        let os = 'Desconocido';
        if (/windows/i.test(s)) os = 'Windows';
        else if (/android/i.test(s)) os = 'Android';
        else if (/iphone|ipod|ipad/i.test(s)) os = 'iOS';
        else if (/mac os/i.test(s)) os = 'macOS';
        else if (/linux/i.test(s)) os = 'Linux';

        let browser = 'Desconocido';
        if (/edg\//i.test(s)) browser = 'Edge';
        else if (/opr\/|opera/i.test(s)) browser = 'Opera';
        else if (/samsungbrowser/i.test(s)) browser = 'Samsung Internet';
        else if (/chrome|crios/i.test(s)) browser = 'Chrome';
        else if (/firefox|fxios/i.test(s)) browser = 'Firefox';
        else if (/safari/i.test(s)) browser = 'Safari';

        let device = 'Escritorio';
        if (/ipad|tablet|android(?!.*mobi)/i.test(s)) device = 'Tableta';
        else if (/mobi|iphone|android/i.test(s)) device = 'Móvil';

        return { os, browser, device };
    }

    /** Geolocalización por IP (gratuita, sin API key). Se ejecuta en segundo plano. */
    private lookupGeo(sessionId: string, ip: string): void {
        if (this.isPrivateIp(ip) || typeof fetch !== 'function') return;
        fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city&lang=es`)
            .then((res) => res.json())
            .then((data: any) => {
                if (data?.status === 'success') {
                    return this.sessionRepo.update(sessionId, {
                        country: data.country || undefined,
                        region: data.regionName || undefined,
                        city: data.city || undefined,
                    });
                }
            })
            .catch(() => { });
    }

    async startVisitorSession(dto: StartSessionDto, req: Request) {
        const ip = this.getClientIp(req);
        const ua = String(req.headers['user-agent'] || '').slice(0, 500);
        const { os, browser, device } = this.parseUserAgent(ua);

        const session = this.sessionRepo.create({
            ip,
            userAgent: ua,
            os,
            browser,
            device,
            referrer: dto.referrer ? dto.referrer.slice(0, 500) : undefined,
            language: dto.language ? dto.language.slice(0, 20) : undefined,
            screen: dto.screen ? dto.screen.slice(0, 20) : undefined,
            lastSeenAt: new Date(),
        });
        await this.sessionRepo.save(session);

        let pageViewId: string | null = null;
        if (dto.path) {
            const pv = this.pageViewRepo.create({
                sessionId: session.id,
                path: dto.path.slice(0, 300),
            });
            await this.pageViewRepo.save(pv);
            pageViewId = pv.id;
        }

        this.lookupGeo(session.id, ip);
        return { ok: true, sessionId: session.id, pageViewId };
    }

    async recordPageView(dto: PageViewDto) {
        const session = await this.sessionRepo.findOne({ where: { id: dto.sessionId } });
        if (!session) return { ok: false };

        await this.sessionRepo.update(session.id, { lastSeenAt: new Date() });
        const pv = this.pageViewRepo.create({
            sessionId: session.id,
            path: dto.path.slice(0, 300),
        });
        await this.pageViewRepo.save(pv);
        return { ok: true, pageViewId: pv.id };
    }

    async visitHeartbeat(dto: HeartbeatDto) {
        const session = await this.sessionRepo.findOne({ where: { id: dto.sessionId } });
        if (!session) return { ok: false };

        await this.sessionRepo.update(session.id, { lastSeenAt: new Date() });

        if (dto.pageViewId && typeof dto.seconds === 'number') {
            // Máximo 6 horas por página para evitar valores absurdos
            const seconds = Math.max(0, Math.min(Math.round(dto.seconds), 6 * 3600));
            const pv = await this.pageViewRepo.findOne({ where: { id: dto.pageViewId, sessionId: session.id } });
            if (pv && seconds > pv.durationSeconds) {
                await this.pageViewRepo.update(pv.id, { durationSeconds: seconds });
            }
        }
        return { ok: true };
    }

    private sessionDuration(s: VisitorSession): number {
        if (!s.lastSeenAt || !s.startedAt) return 0;
        const diff = (new Date(s.lastSeenAt).getTime() - new Date(s.startedAt).getTime()) / 1000;
        return Math.max(0, Math.round(diff));
    }

    async getVisitorSessions(filters: VisitorFilters) {
        const qb = this.sessionRepo.createQueryBuilder('s')
            .leftJoinAndSelect('s.pageViews', 'pv')
            .where('s.startedAt >= :start', { start: filters.start })
            .andWhere('s.startedAt <= :end', { end: filters.end });

        if (filters.country) qb.andWhere('s.country = :country', { country: filters.country });
        if (filters.device) qb.andWhere('s.device = :device', { device: filters.device });
        if (filters.search) qb.andWhere('s.ip LIKE :search', { search: `%${filters.search}%` });
        if (filters.path) {
            qb.andWhere(
                's.id IN (SELECT "pv2"."sessionId" FROM "page_views" "pv2" WHERE "pv2"."path" = :path)',
                { path: filters.path },
            );
        }

        qb.orderBy('s.startedAt', 'DESC')
            .addOrderBy('pv.enteredAt', 'ASC')
            .skip((filters.page - 1) * filters.limit)
            .take(filters.limit);

        const [sessions, total] = await qb.getManyAndCount();

        return {
            total,
            page: filters.page,
            limit: filters.limit,
            sessions: sessions.map((s) => ({
                id: s.id,
                ip: s.ip,
                country: s.country,
                region: s.region,
                city: s.city,
                browser: s.browser,
                os: s.os,
                device: s.device,
                referrer: s.referrer,
                language: s.language,
                screen: s.screen,
                startedAt: s.startedAt,
                lastSeenAt: s.lastSeenAt,
                durationSeconds: this.sessionDuration(s),
                pageViews: (s.pageViews || []).map((pv) => ({
                    id: pv.id,
                    path: pv.path,
                    enteredAt: pv.enteredAt,
                    durationSeconds: pv.durationSeconds,
                })),
            })),
        };
    }

    async getVisitorStats(start: Date, end: Date, groupBy: 'day' | 'month', tzOffset: number) {
        const [sessions, legacyVisits] = await Promise.all([
            this.sessionRepo.find({
                where: { startedAt: Between(start, end) },
                relations: ['pageViews'],
            }),
            this.visitRepo.find({ where: { createdAt: Between(start, end) } }),
        ]);

        // Clave de agrupación en la zona horaria del navegador del admin
        const toKey = (d: Date): string => {
            const local = new Date(new Date(d).getTime() - tzOffset * 60000);
            const iso = local.toISOString();
            return groupBy === 'month' ? iso.slice(0, 7) : iso.slice(0, 10);
        };

        // Generar todos los buckets del rango para que la gráfica no tenga huecos
        const series: Record<string, { sessions: number; legacy: number; uniqueIps: Set<string> }> = {};
        const cursor = new Date(new Date(start).getTime() - tzOffset * 60000);
        const endLocal = new Date(new Date(end).getTime() - tzOffset * 60000);
        let guard = 0;
        while (cursor <= endLocal && guard < 800) {
            const key = groupBy === 'month' ? cursor.toISOString().slice(0, 7) : cursor.toISOString().slice(0, 10);
            if (!series[key]) series[key] = { sessions: 0, legacy: 0, uniqueIps: new Set() };
            if (groupBy === 'month') cursor.setUTCMonth(cursor.getUTCMonth() + 1);
            else cursor.setUTCDate(cursor.getUTCDate() + 1);
            guard++;
        }

        const uniqueIps = new Set<string>();
        let totalDuration = 0;
        let totalPageViews = 0;
        const pageStats: Record<string, { views: number; totalSeconds: number }> = {};
        const byDevice: Record<string, number> = {};
        const byBrowser: Record<string, number> = {};
        const byCountry: Record<string, number> = {};

        sessions.forEach((s) => {
            const key = toKey(s.startedAt);
            if (!series[key]) series[key] = { sessions: 0, legacy: 0, uniqueIps: new Set() };
            series[key].sessions++;
            if (s.ip) {
                series[key].uniqueIps.add(s.ip);
                uniqueIps.add(s.ip);
            }
            totalDuration += this.sessionDuration(s);

            const device = s.device || 'Desconocido';
            const browserName = s.browser || 'Desconocido';
            const countryName = s.country || 'Desconocido';
            byDevice[device] = (byDevice[device] || 0) + 1;
            byBrowser[browserName] = (byBrowser[browserName] || 0) + 1;
            byCountry[countryName] = (byCountry[countryName] || 0) + 1;

            (s.pageViews || []).forEach((pv) => {
                totalPageViews++;
                if (!pageStats[pv.path]) pageStats[pv.path] = { views: 0, totalSeconds: 0 };
                pageStats[pv.path].views++;
                pageStats[pv.path].totalSeconds += pv.durationSeconds || 0;
            });
        });

        // Visitas del contador antiguo (sin detalle) para conservar el histórico
        legacyVisits.forEach((v) => {
            const key = toKey(v.createdAt);
            if (!series[key]) series[key] = { sessions: 0, legacy: 0, uniqueIps: new Set() };
            series[key].legacy++;
        });

        const totalSessions = sessions.length;
        const totalLegacy = legacyVisits.length;

        return {
            totalSessions,
            totalLegacy,
            totalVisits: totalSessions + totalLegacy,
            uniqueVisitors: uniqueIps.size,
            totalPageViews,
            avgDurationSeconds: totalSessions ? Math.round(totalDuration / totalSessions) : 0,
            avgPagesPerSession: totalSessions ? Math.round((totalPageViews / totalSessions) * 10) / 10 : 0,
            series: Object.entries(series)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, v]) => ({
                    key,
                    sessions: v.sessions,
                    legacy: v.legacy,
                    total: v.sessions + v.legacy,
                    uniqueVisitors: v.uniqueIps.size,
                })),
            topPages: Object.entries(pageStats)
                .map(([path, v]) => ({
                    path,
                    views: v.views,
                    avgSeconds: v.views ? Math.round(v.totalSeconds / v.views) : 0,
                }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 15),
            byDevice,
            byBrowser,
            byCountry,
        };
    }

    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

        const [
            totalRepairs,
            totalOrders,
            legacyVisitCount,
            sessionCount,
            monthlyPayments,
            pendingPayments,
            recentVisits,
        ] = await Promise.all([
            this.repairRepo.count(),
            this.orderRepo.count(),
            this.visitRepo.count(),
            this.sessionRepo.count(),
            this.paymentRepo.find({
                where: {
                    status: PaymentStatusEnum.COMPLETED,
                    createdAt: Between(startOfMonth, now),
                },
            }),
            this.paymentRepo.find({
                where: { status: PaymentStatusEnum.PENDING },
            }),
            this.visitRepo.find({
                where: { createdAt: Between(thirtyDaysAgo, now) }
            }),
        ]);

        let monthlyRevenue = 0;
        let repairIncome = 0;
        let productSales = 0;
        monthlyPayments.forEach((p) => {
            const amount = Number(p.amount);
            monthlyRevenue += amount;
            if (p.repairId) repairIncome += amount;
            if (p.orderId) productSales += amount;
        });

        let pendingTotal = 0;
        pendingPayments.forEach((p) => { pendingTotal += Number(p.amount); });

        const visitsByDate: Record<string, number> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            visitsByDate[d.toISOString().split('T')[0]] = 0;
        }

        recentVisits.forEach(v => {
            const dateStr = v.createdAt.toISOString().split('T')[0];
            if (visitsByDate[dateStr] !== undefined) {
                visitsByDate[dateStr]++;
            }
        });

        const visitHistory = Object.entries(visitsByDate).map(([date, count]) => ({ date, count }));

        return {
            totalRepairs,
            totalOrders,
            totalVisits: legacyVisitCount + sessionCount,
            monthlyRevenue,
            repairIncome,
            productSales,
            pendingTotal,
            pendingCount: pendingPayments.length,
            visitHistory,
        };
    }

    async getRevenueReport(startDate: Date, endDate: Date) {
        const payments = await this.paymentRepo.find({
            where: {
                status: PaymentStatusEnum.COMPLETED,
                createdAt: Between(startDate, endDate),
            },
            relations: ['repair', 'order'],
            order: { createdAt: 'ASC' },
        });

        return payments.map((p) => ({
            id: p.id,
            fecha: p.createdAt,
            monto: p.amount,
            metodo: p.method,
            tipo: p.repairId ? 'Reparación' : 'Venta',
            descripcion: p.description,
            transaccion: p.transactionId,
        }));
    }

    async exportCSV(startDate: Date, endDate: Date): Promise<string> {
        const data = await this.getRevenueReport(startDate, endDate);
        const headers = 'ID,Fecha,Monto,Método,Tipo,Descripción\n';
        const rows = data.map((d) =>
            `${d.id},${d.fecha},${d.monto},${d.metodo},${d.tipo},"${d.descripcion || ''}"`
        ).join('\n');
        return headers + rows;
    }
}
