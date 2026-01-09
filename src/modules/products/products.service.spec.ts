import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PRODUCT_STRATEGIES } from './constants/product-strategies.token';
import { ProductType } from './entities/base-product.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockStrategy = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockStrategies = {
    BOOK: mockStrategy,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(mockStrategies);
  });

  describe('findOne', () => {
    it('returns product when exists', async () => {
      const product = { id: 1, title: 'Book A' };
      mockStrategy.findOne.mockResolvedValue(product);

      const result = await service.findOne(1, ProductType.BOOK);

      expect(mockStrategy.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });

    it('throws BadRequest when product type not supported', async () => {
      await expect(
        service.findOne(1, ProductType.CD),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('create', () => {
    it('creates product when price rules are respected', async () => {
      const dto: any = {
        type: ProductType.BOOK,
        title: 'New Book',
        currentPrice: 150,
        originalValue: 200,
      };

      const created = { id: 10, ...dto };
      mockStrategy.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockStrategy.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('throws BadRequest when price out of allowed range', async () => {
      const dto: any = {
        type: ProductType.BOOK,
        title: 'Bad Book',
        currentPrice: 10,
        originalValue: 200,
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws BadRequest when product type not supported', async () => {
      const dto: any = {
        type: ProductType.DVD,
        title: 'DVD',
        currentPrice: 100,
        originalValue: 100,
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('removes product successfully', async () => {
      mockStrategy.remove.mockResolvedValue({ success: true });

      const result = await service.remove(1, ProductType.BOOK);

      expect(mockStrategy.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });
});
