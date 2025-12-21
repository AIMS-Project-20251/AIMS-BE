import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { CD } from "../entities/cd.entity";
import { Like, Repository } from "typeorm";
import { CreateCdDto } from "../dto/create-cd.dto";
import { ProductType } from "../entities/base-product.entity";
import { UpdateCdDto } from "../dto/update-cd.dto";
import { NotFoundException } from "@nestjs/common";

export class CdsStrategy implements ProductsStrategy {
    type = ProductType.CD;

    constructor(
        @InjectRepository(CD) private cdRepo: Repository<CD>
    ) {}

    async findAll(search?: string, category?: string) {
        const where: any = { isActive: true };
        if (search) where.title = Like(`%${search}%`);
        if (category) where.category = category;
    
        return this.cdRepo.find({ where });
    }

    async findOne(id: number) {
        const product = await this.cdRepo.findOne({ where: { id } });
        if (product) return product;

        throw new Error('Product not found');
    }
    async create(dto: CreateCdDto) {
        const product = this.cdRepo.create({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.CD,
            weight: dto.weight,
            isActive: true,
            artists: dto.artists,
            recordLabel: dto.recordLabel,
            tracks: dto.tracks,
            genre: dto.genre,
            releaseDate: dto.releaseDate,
        });

        return this.cdRepo.save(product);
    }
    async update(id: number, dto: UpdateCdDto) {
        const product = await this.cdRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        Object.assign(product, {
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.CD,
            weight: dto.weight,
            isActive: dto.isActive,
            artists: dto.artists,
            recordLabel: dto.recordLabel,
            tracks: dto.tracks,
            genre: dto.genre,
            releaseDate: dto.releaseDate,
        });

        return this.cdRepo.save(product);
    }
    async remove(id: number) {
        const product = await this.cdRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return this.cdRepo.remove(product);
    }
}