import { ProductRepository  } from "../repositories/product.repository"; 
import { CreateProductDTO, UpdateProductDTO, ProductQuery, CreateVariantDTO } from "../types"; 

export class ProductService {
    private repository : ProductRepository;

    constructor() { 
        this.repository  = new ProductRepository();
    }

    async createProduct(data: CreateProductDTO) { 
        return this.repository.create(data);
    }
    async getProducts(query: ProductQuery) { 
        return this.repository.findAll(query);
    }
    async getProductById(id: string) { 
        const product = await this.repository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async updateProduct(id: string, data: UpdateProductDTO) { 

        const product = await this.repository.update(id, data);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async getVariantById(variantId: string) {
        const variant = await this.repository.findVariantById(variantId);
        if (!variant) {
            throw new Error('Variant not found');
        }
        return variant;
    }
    async createVariant(data: CreateVariantDTO) { 
        const product = await this.repository.createVariant(data);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async getProductBySlug(slug: string) { 
        const product = await this.repository.findBySlug(slug);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async deleteProduct(id: string) {
        return this.repository.delete(id);
    }
    async addProductImages(productId: string, images: { imageUrl: string; sortOrder: number }[]) {
        const product = await this.repository.findById(productId);
        if (!product) {
        throw new Error('Product not found');
        }
        return this.repository.addImages(productId, images);
    }
    async publishProduct(id: string) {
        const product = await this.repository.findById(id);
        if (!product) {
        throw new Error('Product not found');
        }
        return this.repository.publish(id);
    }

    // ============= Grosir Config Management =============

    async setGrosirAllocations(productId: string, allocations: { variantId: string | null; allocationQuantity: number }[]) {
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Validate allocation quantities
        for (const a of allocations) {
            if (a.allocationQuantity < 1) {
                throw new Error('Allocation quantity must be at least 1');
            }
        }

        return this.repository.setGrosirAllocations(productId, allocations);
    }

    async setWarehouseTolerance(productId: string, tolerances: { variantId: string | null; maxExcessUnits: number; clearanceRateEstimate?: number }[]) {
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Validate tolerance values
        for (const t of tolerances) {
            if (t.maxExcessUnits < 0) {
                throw new Error('Max excess units cannot be negative');
            }
            if (t.clearanceRateEstimate && (t.clearanceRateEstimate < 0 || t.clearanceRateEstimate > 1)) {
                throw new Error('Clearance rate estimate must be between 0 and 1');
            }
        }

        return this.repository.setWarehouseTolerance(productId, tolerances);
    }

    async getGrosirConfig(productId: string) {
        const product = await this.repository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return this.repository.getGrosirConfig(productId);
    }
}