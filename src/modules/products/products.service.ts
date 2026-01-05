import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProductType } from './entities/base-product.entity';
import { ProductsStrategy } from './strategies/products.strategy.interface';
import { BooksStrategy } from './strategies/books.strategy';
import { CdsStrategy } from './strategies/cds.strategy';
import { DvdsStrategy } from './strategies/dvds.strategy';
import { NewspapersStrategy } from './strategies/newspapers.strategy';
import { PRODUCT_STRATEGIES } from './constants/product-strategies.token';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateCdDto } from './dto/create-cd.dto';
import { CreateDvdDto } from './dto/create-dvd.dto';
import { CreateNewspaperDto } from './dto/create-newspaper.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateCdDto } from './dto/update-cd.dto';
import { UpdateDvdDto } from './dto/update-dvd.dto';
import { UpdateNewspaperDto } from './dto/update-newspapers.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_STRATEGIES)
    private readonly productsStrategies: Record<ProductType, ProductsStrategy>,
  ) {
  }

  async findAll(search?: string, category?: string) {
    const strategies = Object.values(this.productsStrategies);
    const results = await Promise.all(
      strategies.map((strategy) => strategy.findAll(search, category)),
    );
    return results.flat();
  }

  async findOne(id: number, type: ProductType) {
    const strategy = this.productsStrategies[type];
    if (!strategy) {
      throw new BadRequestException(`Product type ${type} does not exist`);
    }
    return strategy.findOne(id);
  }

  async create(dto: CreateBookDto | CreateCdDto | CreateDvdDto | CreateNewspaperDto) {
    const strategy = this.productsStrategies[dto.type];
    if (!strategy) {
      throw new BadRequestException(`Product type ${dto.type} does not exist`);
    }

    const newCurrent = dto.currentPrice;
    const newOriginal = dto.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);

    return strategy.create(dto);
  }

  async update(id: number, dto: UpdateBookDto | UpdateCdDto | UpdateDvdDto | UpdateNewspaperDto) {
    const product = await this.findOne(id, dto.type);
    const strategy = this.productsStrategies[dto.type];
    if (!strategy) {
      throw new BadRequestException(`Product type ${dto.type} does not exist`);
    }

    const newCurrent = dto.currentPrice;
    const newOriginal = dto.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);

    return strategy.update(id, dto);
  }
  
  async remove(id: number, type: ProductType) {
    const strategy = this.productsStrategies[type];
    if (!strategy) {
      throw new BadRequestException(`Product type ${type} does not exist`);
    }
    return strategy.remove(id);
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