import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Book } from './entities/book.entity';
import { CD } from './entities/cd.entity';
import { DVD } from './entities/dvd.entity';
import { Newspaper } from './entities/newspaper.entity';

import { ProductType } from './entities/base-product.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(CD)
    private cdRepo: Repository<CD>,

    @InjectRepository(DVD)
    private dvdRepo: Repository<DVD>,

    @InjectRepository(Newspaper)
    private newspaperRepo: Repository<Newspaper>,
  ) {}

  private getRepo(type: ProductType): Repository<any> {
    switch (type) {
      case ProductType.BOOK:
        return this.bookRepo;
      case ProductType.CD:
        return this.cdRepo;
      case ProductType.DVD:
        return this.dvdRepo;
      case ProductType.NEWSPAPER:
        return this.newspaperRepo;
      default:
        throw new BadRequestException('Invalid product type');
    }
  }

  async findAll(search?: string, category?: string) {
    const repos = [this.bookRepo, this.cdRepo, this.dvdRepo, this.newspaperRepo];
  
    const where: any = { isActive: true };
    if (search) where.title = Like(`%${search}%`);
    if (category) where.category = category;
  
    const results = await Promise.all(
      repos.map((repo) => repo.find({ where }))
    );
  
    return results.flat();
  }

  async findOne(id: number) {
    const repos = [
      this.bookRepo,
      this.cdRepo,
      this.dvdRepo,
      this.newspaperRepo,
    ];

    for (const repo of repos) {
      const product = await repo.findOne({ where: { id } });
      if (product) return product;
    }

    throw new NotFoundException('Product not found');
  }

  async create(dto: CreateProductDto) {
    this.validatePriceRules(dto.currentPrice, dto.originalValue);

    const repo = this.getRepoByType(dto.type);
    const product = repo.create(dto);
    return repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const repo = this.getRepoByType(dto.type);
    const product = await this.findOne(id);

    const newCurrent = dto.currentPrice ?? product.currentPrice;
    const newOriginal = dto.originalValue ?? product.originalValue;

    this.validatePriceRules(newCurrent, newOriginal);

    Object.assign(product, dto);
    return repo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    const repo = this.getRepoByType(product.type);

    if (product.quantity > 0) {
      product.isActive = false;
      return repo.save(product);
    }

    return repo.remove(product);
  }

  private getRepoByType(type: ProductType): Repository<any> {
    switch (type) {
      case ProductType.BOOK:
        return this.bookRepo as Repository<any>;
      case ProductType.CD:
        return this.cdRepo as Repository<any>;
      case ProductType.DVD:
        return this.dvdRepo as Repository<any>;
      case ProductType.NEWSPAPER:
        return this.newspaperRepo as Repository<any>;
      default:
        throw new BadRequestException('Invalid product type');
    }
  }
  
  private validatePriceRules(current: number, original: number) {
    const min = original * 0.30;
    const max = original * 1.50;
    if (current < min || current > max) {
      throw new BadRequestException(
        `Price must be between 30% and 150% of original value (${original})`
      );
    }
  }
}