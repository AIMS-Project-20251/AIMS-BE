import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { CD } from "../entities/cd.entity";
import { BaseProduct, ProductType } from "../entities/base-product.entity";
import { Like, Repository } from "typeorm";
import { CreateCdDto } from "../dto/create-cd.dto";
import { UpdateCdDto } from "../dto/update-cd.dto";
import { NotFoundException } from "@nestjs/common";

export class CdsStrategy implements ProductsStrategy {
    type = ProductType.CD;

    constructor(
        @InjectRepository(CD) private cdRepo: Repository<CD>,
        @InjectRepository(BaseProduct) private baseRepo: Repository<BaseProduct>,
    ) {}

    // Helper: Merge data from parent (BaseProduct) and child (CD)
    private mergeData(cd: CD) {
        if (!cd || !cd.baseProduct) return cd;
        const { baseProduct, ...cdData } = cd;
        // Cast to 'any' to avoid "Spread types may only be created from object types" error
        return { ...(baseProduct as any), ...(cdData as any) };
    }

    async findAll(search?: string, category?: string) {
        const query = this.cdRepo.createQueryBuilder('cd')
            .innerJoinAndSelect('cd.baseProduct', 'base')
            .where('base.isActive = :isActive', { isActive: true });

        if (search) query.andWhere('base.title LIKE :search', { search: `%${search}%` });
        if (category) query.andWhere('base.category = :category', { category });

        const cds = await query.getMany();
        return cds.map(c => this.mergeData(c));
    }

    async findOne(id: number) {
        const product = await this.cdRepo.findOne({ 
            where: { id },
            relations: ['baseProduct']
        });
        if (!product) throw new NotFoundException('Product not found');
        return this.mergeData(product);
    }

    async create(dto: CreateCdDto) {
        // 1. Save Base Product
        const baseProduct = await this.baseRepo.save({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.CD,
            weight: dto.weight,
            isActive: true,
        });

        // 2. Save CD with linked ID
        const cd = await this.cdRepo.save({
            id: baseProduct.id,
            artists: dto.artists,
            recordLabel: dto.recordLabel,
            tracks: dto.tracks,
            genre: dto.genre,
            releaseDate: dto.releaseDate,
        });

        return { ...(baseProduct as any), ...(cd as any) };
    }

    async update(id: number, dto: UpdateCdDto) {
        const cd = await this.cdRepo.findOne({ where: { id } });
        if (!cd) throw new NotFoundException('Product not found');

        // Update parent
        await this.baseRepo.update(id, {
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            weight: dto.weight,
            isActive: dto.isActive,
        });

        // Update child
        await this.cdRepo.update(id, {
            artists: dto.artists,
            recordLabel: dto.recordLabel,
            tracks: dto.tracks,
            genre: dto.genre,
            releaseDate: dto.releaseDate,
        });

        return this.findOne(id);
    }

    async remove(id: number) {
        const result = await this.baseRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Product not found');
        return { deleted: true };
    }
}