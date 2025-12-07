import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async findAll(search?: string, category?: string) {
    const where: any = { isActive: true };
    
    if (search) {
      where.title = Like(`%${search}%`);
    }
    if (category) {
      where.category = category;
    }

    return this.productRepo.find({ where });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    this.validatePriceRules(dto.currentPrice, dto.originalValue);
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    
    const newCurrent = dto.currentPrice ?? product.currentPrice;
    const newOriginal = dto.originalValue ?? product.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (product.quantity > 0) {
      product.isActive = false;
      return this.productRepo.save(product);
    }
    return this.productRepo.remove(product);
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

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data/Stamp coupling
* - With which class: `Product` entity, repository (TypeORM)
* - Reason: Service reads and writes `Product` entities via the repository and enforces price rules based on product data; depends on DTO shapes for create/update.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `findAll`, `findOne`, `create`, `update`, `remove`, `validatePriceRules`
* - Reason: All methods relate to product lifecycle management; helper `validatePriceRules` supports core functions, keeping the service cohesive.
* ---------------------------------------------------------
*/