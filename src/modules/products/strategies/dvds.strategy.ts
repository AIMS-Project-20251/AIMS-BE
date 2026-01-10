import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { DVD } from "../entities/dvd.entity";
import { BaseProduct, ProductType } from "../entities/base-product.entity";
import { Like, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateDvdDto } from "../dto/create-dvd.dto";
import { UpdateDvdDto } from "../dto/update-dvd.dto";

export class DvdsStrategy implements ProductsStrategy {
    type = ProductType.DVD;

    constructor(
        @InjectRepository(DVD) private dvdRepo: Repository<DVD>,
        @InjectRepository(BaseProduct) private baseRepo: Repository<BaseProduct>,
    ) {}

    // Helper: Merge data from parent (BaseProduct) and child (DVD)
    private mergeData(dvd: DVD) {
        if (!dvd || !dvd.baseProduct) return dvd;
        const { baseProduct, ...dvdData } = dvd;
        // Cast to 'any' to avoid "Spread types may only be created from object types" error
        return { ...(baseProduct as any), ...(dvdData as any) };
    }

    async findAll(search?: string, category?: string) {
        const query = this.dvdRepo.createQueryBuilder('dvd')
            .innerJoinAndSelect('dvd.baseProduct', 'base')
            .where('base.isActive = :isActive', { isActive: true });

        if (search) query.andWhere('base.title LIKE :search', { search: `%${search}%` });
        if (category) query.andWhere('base.category = :category', { category });

        const dvds = await query.getMany();
        return dvds.map(d => this.mergeData(d));
    }

    async findOne(id: number) {
        const product = await this.dvdRepo.findOne({ 
            where: { id },
            relations: ['baseProduct']
        });
        if (!product) throw new NotFoundException('Product not found');
        return this.mergeData(product);
    }

    async create(dto: CreateDvdDto) {
        // 1. Save Base Product
        const baseProduct = await this.baseRepo.save({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.DVD,
            weight: dto.weight,
            isActive: true,
        });

        // 2. Save DVD with linked ID
        const dvd = await this.dvdRepo.save({
            id: baseProduct.id,
            discType: dto.discType,
            director: dto.director,
            runtime: dto.runtime,
            studio: dto.studio,
            language: dto.language,
            subtitles: dto.subtitles,
            releaseDate: dto.releaseDate,
            genre: dto.genre,
        });
        
        return { ...(baseProduct as any), ...(dvd as any) };
    }

    async update(id: number, dto: UpdateDvdDto) {
        const dvd = await this.dvdRepo.findOne({ where: { id } });
        if (!dvd) throw new NotFoundException('Product not found');

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
        await this.dvdRepo.update(id, {
            discType: dto.discType,
            director: dto.director,
            runtime: dto.runtime,
            studio: dto.studio,
            language: dto.language,
            subtitles: dto.subtitles,
            releaseDate: dto.releaseDate,
            genre: dto.genre,
        });

        return this.findOne(id);
    }

    async remove(id: number) {
        const result = await this.baseRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Product not found');
        return { deleted: true };
    }
}