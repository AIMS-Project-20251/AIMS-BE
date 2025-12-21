import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { Book } from "../entities/book.entity";
import { Like, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateBookDto } from "../dto/create-book.dto";
import { ProductType } from "../entities/base-product.entity";
import { UpdateBookDto } from "../dto/update-book.dto";

export class BooksStrategy implements ProductsStrategy {
    type = ProductType.BOOK;

    constructor(
        @InjectRepository(Book) private bookRepo: Repository<Book>
    ) {}

    async findAll(search?: string, category?: string) {
        const where: any = { isActive: true };
        if (search) where.title = Like(`%${search}%`);
        if (category) where.category = category;
    
        return this.bookRepo.find({ where });
    }

    async findOne(id: number) {
        const product = await this.bookRepo.findOne({ where: { id } });
        if (product) return product;
    
        throw new NotFoundException('Product not found');
    }

    async create(dto: CreateBookDto) {
        const product = this.bookRepo.create({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.BOOK,
            weight: dto.weight,
            isActive: true,
            authors: dto.authors,
            coverType: dto.coverType,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            pages: dto.pages,
            language: dto.language,
            genre: dto.genre,
        });
        
        return this.bookRepo.save(product);
    }

    async update(id: number, dto: UpdateBookDto) {
        const product = await this.bookRepo.findOne({ where: { id } });
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
            type: ProductType.BOOK,
            weight: dto.weight,
            isActive: dto.isActive,
            authors: dto.authors,
            coverType: dto.coverType,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            pages: dto.pages,
            language: dto.language,
            genre: dto.genre,
        });

        return this.bookRepo.save(product);
    }

    async remove(id: number) {
        const product = await this.bookRepo.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return this.bookRepo.remove(product);
    }
}