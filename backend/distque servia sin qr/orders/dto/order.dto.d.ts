export declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    customerId?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    shippingAddress?: string;
    items: OrderItemDto[];
}
