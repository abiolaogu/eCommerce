export interface ShippingLabel {
    id: string;
    orderId: string;
    trackingNumber: string;
    carrier: string;
    labelUrl: string;
    createdAt: string;
}

export interface CreateShippingLabelRequest {
    orderId: string;
    address: {
        street: string;
        city: string;
        country: string;
        zip: string;
    };
}
