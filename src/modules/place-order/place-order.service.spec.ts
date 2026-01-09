import { BadRequestException } from '@nestjs/common';
import { PlaceOrderService } from './place-order.service';
import { ProductType } from '../products/entities/base-product.entity';

describe('PlaceOrderService', () => {
  let service: PlaceOrderService;

  const mockOrderRepo: any = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProductStrategy = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockProductsStrategies = {
    [ProductType.BOOK]: mockProductStrategy,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new PlaceOrderService(
      mockProductsStrategies,
      mockOrderRepo,
    );
  });

  it('places an order successfully when products exist and stock is sufficient', async () => {
    const dto: any = {
      customerName: 'A',
      email: 'a@a.com',
      phone: '0123',
      shippingAddress: 'addr',
      city: 'Hanoi',
      items: [
        {
          productId: 1,
          quantity: 2,
          type: ProductType.BOOK,
        },
      ],
    };

    const product = {
      id: 1,
      currentPrice: 100_000,
      weight: 1,
      quantity: 5,
      title: 'Book A',
      isActive: true,
    };

    mockProductStrategy.findOne.mockResolvedValue(product);
    mockProductStrategy.update.mockResolvedValue(undefined);
    mockOrderRepo.create.mockReturnValue(dto);
    mockOrderRepo.save.mockResolvedValue({ id: 10, ...dto });

    const res = await service.placeOrder(dto);

    expect(mockProductStrategy.findOne).toHaveBeenCalledWith(1);
    expect(mockProductStrategy.update).toHaveBeenCalledWith(1, {
      ...product,
      quantity: 3,
    });
    expect(res).toHaveProperty('id', 10);
    expect(product.quantity).toBe(3); // trừ stock
  });

  it('throws when product not found', async () => {
    const dto: any = {
      items: [
        { productId: 999, quantity: 1, type: ProductType.BOOK },
      ],
    };

    mockProductStrategy.findOne.mockResolvedValue(undefined);

    await expect(service.placeOrder(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when product out of stock', async () => {
    const dto: any = {
      items: [
        { productId: 2, quantity: 10, type: ProductType.BOOK },
      ],
    };

    const product = { id: 2, quantity: 2, currentPrice: 100_000, isActive: true, weight: 1, title: 'Book B' };
    mockProductStrategy.findOne.mockResolvedValue(product);

    await expect(service.placeOrder(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('calculates fees only', async () => {
    const dto: any = {
      city: 'HCMC',
      items: [
        { productId: 3, quantity: 2, type: ProductType.BOOK },
      ],
    };

    const product = { id: 3, currentPrice: 50_000, weight: 2 };
    mockProductStrategy.findOne.mockResolvedValue(product);

    const fees = await service.calculateFeesOnly(dto);

    expect(fees).toHaveProperty('subtotal', 100_000);
    expect(fees).toHaveProperty('vatAmount', 10_000); // VAT 10%
    expect(fees).toHaveProperty('currency', 'VND');
  });
});
