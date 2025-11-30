import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockProductRepo: any = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };

  beforeEach(() => {
    mockProductRepo.findOne.mockReset();
    mockProductRepo.find.mockReset();
    mockProductRepo.create.mockReset();
    mockProductRepo.save.mockReset();
    mockProductRepo.remove.mockReset();

    service = new ProductsService(mockProductRepo);
  });

  it('findOne returns product when exists', async () => {
    const prod = { id: 1, title: 'X' } as any;
    mockProductRepo.findOne.mockResolvedValue(prod);
    const res = await service.findOne(1);
    expect(res).toBe(prod);
  });

  it('findOne throws NotFound when missing', async () => {
    mockProductRepo.findOne.mockResolvedValue(undefined);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a product when price rules are respected', async () => {
    const dto: any = { title: 'New', currentPrice: 150, originalValue: 200 };
    mockProductRepo.create.mockReturnValue(dto);
    mockProductRepo.save.mockResolvedValue({ id: 5, ...dto });
    const res = await service.create(dto);
    expect(mockProductRepo.create).toHaveBeenCalledWith(dto);
    expect(res).toHaveProperty('id', 5);
  });

  it('create throws when price out of allowed range', async () => {
    const dto: any = { title: 'Bad', currentPrice: 10, originalValue: 100 };
    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
  });
});
