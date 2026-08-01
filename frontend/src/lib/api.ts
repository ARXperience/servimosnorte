const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.servimosnorte.com/api';

class ApiClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('servimos_token', token);
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('servimos_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('servimos_token');
            localStorage.removeItem('servimos_user');
        }
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
        };

        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}${endpoint}`, { 
            ...options, 
            headers,
            cache: 'no-store' // Evitar caché estático de Next.js para mostrar stock actualizado
        });

        if (res.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
            throw new Error('No autorizado');
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Error del servidor' }));
            throw new Error(error.message || `Error ${res.status}`);
        }

        const text = await res.text();
        if (!text) return {};

        const contentType = res.headers.get('content-type');
        if (contentType?.includes('text/csv')) {
            return text;
        }
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    // Auth & Users
    login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }
    getProfile() { return this.request('/auth/profile'); }
    seedAdmin() { return this.request('/auth/seed', { method: 'POST' }); }
    getUsers() { return this.request('/auth/users'); }
    createUser(data: any) {
        return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    }
    updateUserPassword(id: string, password: string) {
        return this.request(`/auth/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) });
    }
    deleteUser(id: string) {
        return this.request(`/auth/users/${id}`, { method: 'DELETE' });
    }

    // Customers
    getCustomers(search?: string) {
        return this.request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    }
    getCustomer(id: string) { return this.request(`/customers/${id}`); }
    createCustomer(data: any) {
        return this.request('/customers', { method: 'POST', body: JSON.stringify(data) });
    }
    registerContact(data: any) {
        return this.request('/customers/public-contact', { method: 'POST', body: JSON.stringify(data) });
    }
    updateCustomer(id: string, data: any) {
        return this.request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    deleteCustomer(id: string) {
        return this.request(`/customers/${id}`, { method: 'DELETE' });
    }

    // Repairs
    getRepairs(status?: string) {
        return this.request(`/repairs${status ? `?status=${status}` : ''}`);
    }
    getRepair(id: string) { return this.request(`/repairs/${id}`); }
    getRepairByToken(token: string) { return this.request(`/repairs/public/${token}`); }
    createRepair(data: any) {
        return this.request('/repairs', { method: 'POST', body: JSON.stringify(data) });
    }
    requestPublicRepair(data: any) {
        return this.request('/repairs/public/request', { method: 'POST', body: JSON.stringify(data) });
    }
    updateRepair(id: string, data: any) {
        return this.request(`/repairs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    updateRepairStatus(id: string, status: string) {
        return this.request(`/repairs/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    }
    acceptRepair(token: string) {
        return this.request(`/repairs/public/${token}/accept`, { method: 'POST' });
    }
    rejectRepair(token: string) {
        return this.request(`/repairs/public/${token}/reject`, { method: 'POST' });
    }
    getRepairStats() { return this.request('/repairs/stats'); }
    deleteRepair(id: string) {
        return this.request(`/repairs/${id}`, { method: 'DELETE' });
    }

    // Products
    getProducts(category?: string) {
        return this.request(`/products${category ? `?category=${category}` : ''}`);
    }
    getProduct(id: string) { return this.request(`/products/${id}`); }
    createProduct(data: any) {
        return this.request('/products', { method: 'POST', body: JSON.stringify(data) });
    }
    updateProduct(id: string, data: any) {
        return this.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    deleteProduct(id: string) {
        return this.request(`/products/${id}`, { method: 'DELETE' });
    }

    // Orders
    getOrders() { return this.request('/orders'); }
    getOrder(id: string) { return this.request(`/orders/${id}`); }
    createOrder(data: any) {
        return this.request('/orders', { method: 'POST', body: JSON.stringify(data) });
    }
    updateOrderStatus(id: string, status: string) {
        return this.request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    }
    deleteOrder(id: string) {
        return this.request(`/orders/${id}`, { method: 'DELETE' });
    }

    // Payments
    getPayments() { return this.request('/payments'); }
    createPayment(data: any) {
        return this.request('/payments', { method: 'POST', body: JSON.stringify(data) });
    }
    updatePaymentStatus(id: string, status: string) {
        return this.request(`/payments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    }
    createStripeCheckout(data: any) {
        return this.request('/payments/stripe/checkout', { method: 'POST', body: JSON.stringify(data) });
    }
    getPendingPayments() { return this.request('/payments/pending'); }
    getRevenue(start?: string, end?: string) {
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        return this.request(`/payments/revenue?${params.toString()}`);
    }

    // Accounting
    getDashboardStats() { return this.request('/accounting/dashboard'); }
    getVisitors(params: Record<string, string>) {
        const qs = new URLSearchParams(params).toString();
        return this.request(`/accounting/visitors?${qs}`);
    }
    getVisitorStats(params: Record<string, string>) {
        const qs = new URLSearchParams(params).toString();
        return this.request(`/accounting/visitors/stats?${qs}`);
    }
    getAccountingReport(start?: string, end?: string) {
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        return this.request(`/accounting/report?${params.toString()}`);
    }
    exportCSV(start?: string, end?: string) {
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        return this.request(`/accounting/export/csv?${params.toString()}`);
    }

    // WhatsApp
    getWhatsappReportLink(phone: string, token: string, name: string) {
        return this.request(`/whatsapp/report-link?phone=${phone}&token=${token}&name=${encodeURIComponent(name)}`);
    }
    getWhatsappMessageLink(phone: string, message: string) {
        return this.request(`/whatsapp/message-link?phone=${phone}&message=${encodeURIComponent(message)}`);
    }

    // Chatbot
    connectWhatsApp() { return this.request('/chatbot/connect', { method: 'POST' }); }
    getChatbotQR() { return this.request('/chatbot/qr'); }
    getChatbotStatus() { return this.request('/chatbot/status'); }
    disconnectWhatsApp() { return this.request('/chatbot/disconnect', { method: 'POST' }); }
    getChatbotConfig() { return this.request('/chatbot/config'); }
    updateChatbotConfig(data: any) {
        return this.request('/chatbot/config', { method: 'PUT', body: JSON.stringify(data) });
    }
    getChatbotConversations() { return this.request('/chatbot/conversations'); }
    testChatbotMessage(message: string) {
        return this.request('/chatbot/test-message', { method: 'POST', body: JSON.stringify({ message }) });
    }
    sendManualChatMessage(phone: string, message: string) {
        return this.request('/chatbot/send-message', { method: 'POST', body: JSON.stringify({ phone, message }) });
    }
    deleteChatbotConversation(phone: string) {
        return this.request(`/chatbot/conversation/${encodeURIComponent(phone)}`, { method: 'DELETE' });
    }

    // Trash (Papelera)
    getTrash() { return this.request('/trash'); }
    restoreTrash(entity: string, id: string) { return this.request(`/trash/${entity}/${id}/restore`, { method: 'POST' }); }

    // Product Images
    async uploadProductImages(productId: string, files: File[]) {
        const formData = new FormData();
        files.forEach(f => formData.append('images', f));
        const token = this.getToken();
        const res = await fetch(`${API_URL}/products/${productId}/images`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
        if (!res.ok) throw new Error('Error subiendo imágenes');
        return res.json();
    }
}

export const api = new ApiClient();
