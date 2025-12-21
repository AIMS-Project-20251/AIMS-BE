import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { DVD } from "../entities/dvd.entity";
import { Like, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateDvdDto } from "../dto/create-dvd.dto";
import { ProductType } from "../entities/base-product.entity";
import { release } from "os";
import { UpdateCdDto } from "../dto/update-cd.dto";
import { UpdateDvdDto } from "../dto/update-dvd.dto";

export class DvdsStrategy implements ProductsStrategy {
    type = ProductType.DVD;

    constructor(
        @InjectRepository(DVD) private dvdRepo: Repository<DVD>
    ) {}

    async findAll(search?: string, category?: string) {
        const where: any = { isActive: true };
        if (search) where.title = Like(`%${search}%`);
        if (category) where.category = category;
    
        return this.dvdRepo.find({ where });
    }

    async findOne(id: number) {
        const product = await this.dvdRepo.findOne({ where: { id } });
        if (product) return product;
    
        throw new NotFoundException('Product not found');
    }
    async create(dto: CreateDvdDto) {
        const product = this.dvdRepo.create({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.DVD,
            weight: dto.weight,
            isActive: true,
            discType: dto.discType,
            director: dto.director,
            runtime: dto.runtime,
            studio: dto.studio,
            language: dto.language,
            subtitles: dto.subtitles,
            releaseDate: dto.releaseDate,
            genre: dto.genre,
        });
        
        return this.dvdRepo.save(product);
    }
    async update(id: number, dto: UpdateDvdDto) {
        const product = await this.dvdRepo.findOne({ where: { id } });
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
            type: ProductType.DVD,
            weight: dto.weight,
            isActive: dto.isActive,
            discType: dto.discType,
            director: dto.director,
            runtime: dto.runtime,
            studio: dto.studio,
            language: dto.language,
            subtitles: dto.subtitles,
            releaseDate: dto.releaseDate,
            genre: dto.genre,
        });

        return this.dvdRepo.save(product);
    }
    async remove(id: number) {
        const product = await this.dvdRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return this.dvdRepo.remove(product);
    }
}