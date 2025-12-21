import { InjectRepository } from "@nestjs/typeorm";
import { ProductsStrategy } from "./products.strategy.interface";
import { Book } from "../entities/book.entity";
import { BaseProduct, ProductType } from "../entities/base-product.entity";
import { Like, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { CreateBookDto } from "../dto/create-book.dto";
import { UpdateBookDto } from "../dto/update-book.dto";

export class BooksStrategy implements ProductsStrategy {
    type = ProductType.BOOK;

    constructor(
        @InjectRepository(Book) private bookRepo: Repository<Book>,
        @InjectRepository(BaseProduct) private baseRepo: Repository<BaseProduct>,
    ) {}

    // Helper: Merge data from parent (BaseProduct) and child (Book) into a flat object
    private mergeData(book: Book) {
        if (!book || !book.baseProduct) return book;
        const { baseProduct, ...bookData } = book;
        // Cast to 'any' to avoid "Spread types may only be created from object types" error
        return { ...(baseProduct as any), ...(bookData as any) };
    }

    async findAll(search?: string, category?: string) {
        // Query from child table, join parent table to filter
        const query = this.bookRepo.createQueryBuilder('book')
            .innerJoinAndSelect('book.baseProduct', 'base')
            .where('base.isActive = :isActive', { isActive: true });

        if (search) query.andWhere('base.title ILIKE :search', { search: `%${search}%` });
        if (category) query.andWhere('base.category = :category', { category });

        const books = await query.getMany();
        return books.map(b => this.mergeData(b));
    }

    async findOne(id: number) {
        const product = await this.bookRepo.findOne({ 
            where: { id },
            relations: ['baseProduct'] 
        });
        
        if (!product) throw new NotFoundException('Product not found');
        return this.mergeData(product);
    }

    async create(dto: CreateBookDto) {
        // 1. Save Base Product first
        const baseProduct = await this.baseRepo.save({
            title: dto.title,
            category: dto.category,
            originalValue: dto.originalValue,
            currentPrice: dto.currentPrice,
            quantity: dto.quantity,
            imageUrl: dto.imageUrl,
            type: ProductType.BOOK,
            weight: dto.weight,
            isActive: true,
        });

        // 2. Save Book using the newly created ID
        const book = await this.bookRepo.save({
            id: baseProduct.id, // Important: Link IDs
            authors: dto.authors,
            coverType: dto.coverType,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            pages: dto.pages,
            language: dto.language,
            genre: dto.genre,
        });
        
        return { ...(baseProduct as any), ...(book as any) };
    }

    async update(id: number, dto: UpdateBookDto) {
        const book = await this.bookRepo.findOne({ where: { id } });
        if (!book) throw new NotFoundException('Product not found');

        // Update parent table
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

        // Update child table
        await this.bookRepo.update(id, {
            authors: dto.authors,
            coverType: dto.coverType,
            publisher: dto.publisher,
            publicationDate: dto.publicationDate,
            pages: dto.pages,
            language: dto.language,
            genre: dto.genre,
        });

        return this.findOne(id);
    }

    async remove(id: number) {
        // Deleting the parent will automatically delete the child due to CASCADE in database
        const result = await this.baseRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Product not found');
        return { deleted: true };
    }
}