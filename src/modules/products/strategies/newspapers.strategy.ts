import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { Newspaper } from "../entities/newspaper.entity";
import { Like, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateNewspaperDto } from "../dto/create-newspaper.dto";
import { ProductType } from "../entities/base-product.entity";
import { UpdateNewspaperDto } from "../dto/update-newspapers.dto";

export class NewspapersStrategy implements ProductsStrategy {
    type = ProductType.NEWSPAPER;
    
    constructor(
        @InjectRepository(Newspaper) private newspapersRepo: Repository<Newspaper>
    ) {}

    async findAll(search?: string, category?: string) {
        const where: any = { isActive: true };
        if (search) where.title = Like(`%${search}%`);
        if (category) where.category = category;
    
        return this.newspapersRepo.find({ where });
    }

    async findOne(id: number) {
        const product = await this.newspapersRepo.findOne({ where: { id } });
        if (product) return product;
    
        throw new NotFoundException('Product not found');
    }
    async create(dto: CreateNewspaperDto) {
        const product = this.newspapersRepo.create({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.NEWSPAPER,
            weight: dto.weight,
            isActive: true,
            editorInChief: dto.editorInChief,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            issueNumber: dto.issueNumber,
            publicationFrequency: dto.publicationFrequency,
            issn: dto.issn,
            language: dto.language,
            sections: dto.sections,
        });
        
        return this.newspapersRepo.save(product);
    }
    async update(id: number, dto: UpdateNewspaperDto) {
        const product = await this.newspapersRepo.findOne({ where: { id } });
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
            type: ProductType.NEWSPAPER,
            weight: dto.weight,
            isActive: dto.isActive,
            editorInChief: dto.editorInChief,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            issueNumber: dto.issueNumber,
            publicationFrequency: dto.publicationFrequency,
            issn: dto.issn,
            language: dto.language,
            sections: dto.sections,
        });

        return this.newspapersRepo.save(product);
    }
    async remove(id: number) {
        const product = await this.newspapersRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return this.newspapersRepo.remove(product);
    }
}