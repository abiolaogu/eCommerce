export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed';
    createdAt: string;
}

export interface CreatePaymentRequest {
    orderId: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
}
