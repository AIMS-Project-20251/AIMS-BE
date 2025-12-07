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

  async createBook(dto: CreateProductDto) {
    if (dto.type !== ProductType.BOOK) {
      throw new BadRequestException('Invalid type for book');
    }
  
    this.validatePriceRules(dto.currentPrice, dto.originalValue);
  
    const repo = this.bookRepo;
    const product = repo.create({
      ...dto,
      authors: dto.attributes?.authors,
      coverType: dto.attributes?.coverType,
      publisher: dto.attributes?.publisher,
      publicationDate: dto.attributes?.publicationDate,
      pages: dto.attributes?.pages,
      language: dto.attributes?.language,
      genre: dto.attributes?.genre,
    });
  
    return repo.save(product);
  }
  
  async createCD(dto: CreateProductDto) {
    if (dto.type !== ProductType.CD) {
      throw new BadRequestException('Invalid type for CD');
    }
  
    this.validatePriceRules(dto.currentPrice, dto.originalValue);
  
    const repo = this.cdRepo;
    const product = repo.create({
      ...dto,
      artists: dto.attributes?.artists,
      recordLabel: dto.attributes?.recordLabel,
      tracks: dto.attributes?.tracks,
      genre: dto.attributes?.genre,
      releaseDate: dto.attributes?.releaseDate,
    });
  
    return repo.save(product);
  }
  
  async createDVD(dto: CreateProductDto) {
    if (dto.type !== ProductType.DVD) {
      throw new BadRequestException('Invalid type for DVD');
    }
  
    this.validatePriceRules(dto.currentPrice, dto.originalValue);
  
    const repo = this.dvdRepo;
    const product = repo.create({
      ...dto,
      discType: dto.attributes?.discType,
      director: dto.attributes?.director,
      runtime: dto.attributes?.runtime,
      studio: dto.attributes?.studio,
      language: dto.attributes?.language,
      subtitles: dto.attributes?.subtitles,
      releaseDate: dto.attributes?.releaseDate,
      genre: dto.attributes?.genre,
    });
  
    return repo.save(product);
  }
  
  async createNewspaper(dto: CreateProductDto) {
    if (dto.type !== ProductType.NEWSPAPER) {
      throw new BadRequestException('Invalid type for newspaper');
    }
  
    this.validatePriceRules(dto.currentPrice, dto.originalValue);
  
    const repo = this.newspaperRepo;
    const product = repo.create({
      ...dto,
      editorInChief: dto.attributes?.editorInChief,
      publisher: dto.attributes?.publisher,
      publicationDate: dto.attributes?.publicationDate,
      issueNumber: dto.attributes?.issueNumber,
      publicationFrequency: dto.attributes?.publicationFrequency,
      issn: dto.attributes?.issn,
      language: dto.attributes?.language,
      sections: dto.attributes?.sections,
    });
  
    return repo.save(product);
  }

  async updateBook(id: number, dto: CreateProductDto) {
    if (dto.type !== ProductType.BOOK) {
      throw new BadRequestException('Invalid type for book');
    }
  
    const product = await this.bookRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Book not found');
  
    const newCurrent = dto.currentPrice ?? product.currentPrice;
    const newOriginal = dto.originalValue ?? product.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);
  
    Object.assign(product, {
      ...dto,
      authors: dto.attributes?.authors,
      coverType: dto.attributes?.coverType,
      publisher: dto.attributes?.publisher,
      publicationDate: dto.attributes?.publicationDate,
      pages: dto.attributes?.pages,
      language: dto.attributes?.language,
      genre: dto.attributes?.genre,
    });
  
    return this.bookRepo.save(product);
  }
  
  async updateCD(id: number, dto: CreateProductDto) {
    if (dto.type !== ProductType.CD) {
      throw new BadRequestException('Invalid type for CD');
    }
  
    const product = await this.cdRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('CD not found');
  
    const newCurrent = dto.currentPrice ?? product.currentPrice;
    const newOriginal = dto.originalValue ?? product.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);
  
    Object.assign(product, {
      ...dto,
      artists: dto.attributes?.artists,
      recordLabel: dto.attributes?.recordLabel,
      tracks: dto.attributes?.tracks,
      genre: dto.attributes?.genre,
      releaseDate: dto.attributes?.releaseDate,
    });
  
    return this.cdRepo.save(product);
  }
  
  async updateDVD(id: number, dto: CreateProductDto) {
    if (dto.type !== ProductType.DVD) {
      throw new BadRequestException('Invalid type for DVD');
    }
  
    const product = await this.dvdRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('DVD not found');
  
    const newCurrent = dto.currentPrice ?? product.currentPrice;
    const newOriginal = dto.originalValue ?? product.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);
  
    Object.assign(product, {
      ...dto,
      discType: dto.attributes?.discType,
      director: dto.attributes?.director,
      runtime: dto.attributes?.runtime,
      studio: dto.attributes?.studio,
      language: dto.attributes?.language,
      subtitles: dto.attributes?.subtitles,
      releaseDate: dto.attributes?.releaseDate,
      genre: dto.attributes?.genre,
    });
  
    return this.dvdRepo.save(product);
  }
  
  async updateNewspaper(id: number, dto: CreateProductDto) {
    if (dto.type !== ProductType.NEWSPAPER) {
      throw new BadRequestException('Invalid type for newspaper');
    }
  
    const product = await this.newspaperRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Newspaper not found');
  
    const newCurrent = dto.currentPrice ?? product.currentPrice;
    const newOriginal = dto.originalValue ?? product.originalValue;
    this.validatePriceRules(newCurrent, newOriginal);
  
    Object.assign(product, {
      ...dto,
      editorInChief: dto.attributes?.editorInChief,
      publisher: dto.attributes?.publisher,
      publicationDate: dto.attributes?.publicationDate,
      issueNumber: dto.attributes?.issueNumber,
      publicationFrequency: dto.attributes?.publicationFrequency,
      issn: dto.attributes?.issn,
      language: dto.attributes?.language,
      sections: dto.attributes?.sections,
    });
  
    return this.newspaperRepo.save(product);
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