import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { Newspaper } from "../entities/newspaper.entity";
import { BaseProduct, ProductType } from "../entities/base-product.entity";
import { Like, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateNewspaperDto } from "../dto/create-newspaper.dto";
import { UpdateNewspaperDto } from "../dto/update-newspapers.dto";

export class NewspapersStrategy implements ProductsStrategy {
    type = ProductType.NEWSPAPER;
    
    constructor(
        @InjectRepository(Newspaper) private newspapersRepo: Repository<Newspaper>,
        @InjectRepository(BaseProduct) private baseRepo: Repository<BaseProduct>,
    ) {}

    // Helper: Merge data from parent (BaseProduct) and child (Newspaper)
    private mergeData(news: Newspaper) {
        if (!news || !news.baseProduct) return news;
        const { baseProduct, ...newsData } = news;
        // Cast to 'any' to avoid "Spread types may only be created from object types" error
        return { ...(baseProduct as any), ...(newsData as any) };
    }

    async findAll(search?: string, category?: string) {
        const query = this.newspapersRepo.createQueryBuilder('newspaper')
            .innerJoinAndSelect('newspaper.baseProduct', 'base')
            .where('base.isActive = :isActive', { isActive: true });

        if (search) query.andWhere('base.title ILIKE :search', { search: `%${search}%` });
        if (category) query.andWhere('base.category = :category', { category });

        const news = await query.getMany();
        return news.map(n => this.mergeData(n));
    }

    async findOne(id: number) {
        const product = await this.newspapersRepo.findOne({ 
            where: { id },
            relations: ['baseProduct']
        });
        if (!product) throw new NotFoundException('Product not found');
        return this.mergeData(product);
    }

    async create(dto: CreateNewspaperDto) {
        // 1. Save Base Product
        const baseProduct = await this.baseRepo.save({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.NEWSPAPER,
            weight: dto.weight,
            isActive: true,
        });

        // 2. Save Newspaper with linked ID
        const news = await this.newspapersRepo.save({
            id: baseProduct.id,
            editorInChief: dto.editorInChief,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            issueNumber: dto.issueNumber,
            publicationFrequency: dto.publicationFrequency,
            issn: dto.issn,
            language: dto.language,
            sections: dto.sections,
        });
        
        return { ...(baseProduct as any), ...(news as any) };
    }

    async update(id: number, dto: UpdateNewspaperDto) {
        const news = await this.newspapersRepo.findOne({ where: { id } });
        if (!news) throw new NotFoundException('Product not found');

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
        await this.newspapersRepo.update(id, {
            editorInChief: dto.editorInChief,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            issueNumber: dto.issueNumber,
            publicationFrequency: dto.publicationFrequency,
            issn: dto.issn,
            language: dto.language,
            sections: dto.sections,
        });

        return this.findOne(id);
    }

    async remove(id: number) {
        const result = await this.baseRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Product not found');
        return { deleted: true };
    }
}