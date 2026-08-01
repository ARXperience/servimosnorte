export const statusLabelsMap: Record<string, string> = {
    PENDING: 'Pendiente de pago / En verificación',
    PAID: 'Pago Recibido / Confirmado',
    SHIPPED: 'En camino / Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

export const ADMIN_DEFAULT_PHONE = '3125846294';
export const ADMIN_DEFAULT_EMAIL = 'servimosnorte@gmail.com';

export function formatCopCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(num || 0);
}

export function cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (!clean) return '';
    // Si tiene 10 dígitos y empieza por 3 (ej. Colombia 3001234567), agregar 57
    if (clean.length === 10 && clean.startsWith('3')) {
        return `57${clean}`;
    }
    return clean;
}

export function buildOrderDetails(order: any) {
    const radicado = order.radicado || (order.id ? `ORD-${order.id.slice(0, 8).toUpperCase()}` : 'N/A');
    const customerName = order.customer?.fullName || order.guestName || 'Cliente';
    const customerPhone = order.customer?.phone || order.guestPhone || '';
    const customerEmail = order.customer?.email || order.guestEmail || '';
    const statusText = statusLabelsMap[order.status] || order.status || 'Pendiente';
    
    const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
    const formattedDate = dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const items = order.items || [];
    const itemsList = items.map((i: any) => {
        const name = i.product?.name || i.name || 'Producto';
        const qty = i.quantity || 1;
        const price = formatCopCurrency(i.unitPrice || i.price || 0);
        return `* ${qty}x ${name} (${price})`;
    }).join('\n') || '* Detalle de productos según pedido';

    const deliveryCostNum = Number(order.deliveryCost || 0);
    const deliveryText = order.shippingAddress || 'Recoger en tienda';
    const deliveryCostText = deliveryCostNum > 0 ? formatCopCurrency(deliveryCostNum) : 'Sin costo / En tienda';
    const totalText = formatCopCurrency(Number(order.total || 0));

    return {
        radicado,
        customerName,
        customerPhone,
        customerEmail,
        statusText,
        formattedDate,
        itemsList,
        deliveryText,
        deliveryCostText,
        totalText,
    };
}

// ==========================================
// 1. NOTIFICACIÓN DIRIGIDA AL ADMINISTRADOR
// (Mensaje 100% limpio sin emojis que originen símbolos  en WhatsApp)
// ==========================================

export function buildAdminNotificationMessage(order: any): { fullWhatsAppMessage: string; emailSubject: string; emailBodyText: string } {
    const d = buildOrderDetails(order);

    const fullWhatsAppMessage = 
`*CONFIRMACION DE CREACION DE PEDIDO Y PAGO*

Hola Administrador, se ha registrado la creacion del pedido y su pago:

* [ORDEN]: ${d.radicado}
* [CLIENTE]: ${d.customerName}
* [TELEFONO]: ${d.customerPhone || 'No registrado'}
* [EMAIL]: ${d.customerEmail || 'No registrado'}
* [ENTREGA]: ${d.deliveryText}
* [ESTADO]: ${d.statusText}
* [FECHA]: ${d.formattedDate}

*DETALLE DEL PEDIDO:*
${d.itemsList}

----------------------------------
* [DOMICILIO]: ${d.deliveryCostText}
* [TOTAL REGISTRADO]: ${d.totalText}

Solicito confirmacion de recepcion y procesamiento del pedido. ¡Muchas gracias!`;

    const emailSubject = `Confirmación de Creación de Pedido y Recepción de Pago ${d.radicado} - ${d.customerName}`;
    const emailBodyText = 
`Atención Administrador de Servimos Norte,

Se confirma la creación del pedido y la recepción del pago del siguiente pedido registrado en la plataforma:

--------------------------------------------------
DATOS DEL PEDIDO
--------------------------------------------------
Número de Orden: ${d.radicado}
Fecha: ${d.formattedDate}
Estado actual: ${d.statusText}

DATOS DEL CLIENTE:
Nombre: ${d.customerName}
Teléfono: ${d.customerPhone || 'N/A'}
Email: ${d.customerEmail || 'N/A'}
Lugar de entrega: ${d.deliveryText}

PRODUCTOS SOLICITADOS:
${d.itemsList}

--------------------------------------------------
RESUMEN DE PAGO
--------------------------------------------------
Costo de domicilio: ${d.deliveryCostText}
TOTAL GENERAL: ${d.totalText}

--------------------------------------------------
Por favor verificar el pago en el panel de administración y proceder con el despacho o preparación correspondiente.

Servimos Norte - Sistema de Ventas`;

    return { fullWhatsAppMessage, emailSubject, emailBodyText };
}

export function getAdminNotificationWhatsAppLink(order: any, adminPhone: string = ADMIN_DEFAULT_PHONE): string {
    const { fullWhatsAppMessage } = buildAdminNotificationMessage(order);
    const cleanPhone = cleanPhoneNumber(adminPhone);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullWhatsAppMessage)}`;
}

export function getAdminNotificationEmailDraftLink(order: any, adminEmail: string = ADMIN_DEFAULT_EMAIL): string {
    const { emailSubject, emailBodyText } = buildAdminNotificationMessage(order);
    return `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
}

export function getAdminNotificationGmailLink(order: any, adminEmail: string = ADMIN_DEFAULT_EMAIL): string {
    const { emailSubject, emailBodyText } = buildAdminNotificationMessage(order);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
}

// ==========================================
// 2. NOTIFICACIÓN DIRIGIDA AL CLIENTE
// ==========================================

export function buildCustomerNotificationMessage(order: any): { fullWhatsAppMessage: string; emailSubject: string; emailBodyText: string } {
    const d = buildOrderDetails(order);

    const fullWhatsAppMessage = 
`*SERVIMOS NORTE - CONFIRMACION DE TU PEDIDO*

Hola ${d.customerName}, confirmamos la recepcion de tu pago y la creacion de tu pedido:

* [ORDEN]: ${d.radicado}
* [ENTREGA]: ${d.deliveryText}
* [ESTADO]: ${d.statusText}
* [FECHA]: ${d.formattedDate}

*DETALLE DEL PEDIDO:*
${d.itemsList}

----------------------------------
* [DOMICILIO]: ${d.deliveryCostText}
* [TOTAL]: ${d.totalText}

Estamos procesando tu pedido. Si tienes dudas, contactanos a traves de esta linea. ¡Gracias por tu compra!`;

    const emailSubject = `Confirmación y Estado de tu Pedido ${d.radicado} - Servimos Norte`;
    const emailBodyText = 
`Estimado(a) ${d.customerName},

Confirmamos la recepción de tu pago y la creación exitosa de tu pedido en Servimos Norte:

--------------------------------------------------
DETALLES DE TU PEDIDO
--------------------------------------------------
Número de Orden: ${d.radicado}
Fecha: ${d.formattedDate}
Estado: ${d.statusText}

Lugar de entrega: ${d.deliveryText}

PRODUCTOS:
${d.itemsList}

--------------------------------------------------
PAGO Y TOTAL
--------------------------------------------------
Costo de domicilio: ${d.deliveryCostText}
TOTAL: ${d.totalText}

--------------------------------------------------
Gracias por tu confianza. Si necesitas comunicarte con nosotros, responde a este correo o escríbenos a nuestro WhatsApp.

Atentamente,
Servimos Norte`;

    return { fullWhatsAppMessage, emailSubject, emailBodyText };
}

export function getCustomerNotificationWhatsAppLink(order: any): string {
    const { fullWhatsAppMessage } = buildCustomerNotificationMessage(order);
    const cleanPhone = cleanPhoneNumber(order.customer?.phone || order.guestPhone || ADMIN_DEFAULT_PHONE);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullWhatsAppMessage)}`;
}

export function getCustomerNotificationEmailDraftLink(order: any): string {
    const { emailSubject, emailBodyText } = buildCustomerNotificationMessage(order);
    const customerEmail = order.customer?.email || order.guestEmail || '';
    return `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
}

export function getCustomerNotificationGmailLink(order: any): string {
    const { emailSubject, emailBodyText } = buildCustomerNotificationMessage(order);
    const customerEmail = order.customer?.email || order.guestEmail || '';
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customerEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
}

// Compatibilidad general
export function getWhatsAppOrderLink(order: any, customPhone?: string): string {
    if (customPhone) {
        const { fullWhatsAppMessage } = buildAdminNotificationMessage(order);
        return `https://wa.me/${cleanPhoneNumber(customPhone)}?text=${encodeURIComponent(fullWhatsAppMessage)}`;
    }
    return getCustomerNotificationWhatsAppLink(order);
}

export function getEmailOrderDraftLink(order: any, customEmail?: string): string {
    if (customEmail) {
        const { emailSubject, emailBodyText } = buildAdminNotificationMessage(order);
        return `mailto:${encodeURIComponent(customEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    }
    return getCustomerNotificationEmailDraftLink(order);
}

export function getGmailOrderDraftLink(order: any, customEmail?: string): string {
    if (customEmail) {
        return getAdminNotificationGmailLink(order, customEmail);
    }
    return getCustomerNotificationGmailLink(order);
}
