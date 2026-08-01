export declare enum ProductCategory {
    REFURBISHED = "REFURBISHED",
    SPARE_PART = "SPARE_PART",
    ACCESSORY = "ACCESSORY"
}
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: ProductCategory;
    warrantyInfo: string;
    images: string[];
    isActive: boolean;
    brand: string;
    applianceType: string;
    createdAt: Date;
    updatedAt: Date;
}
