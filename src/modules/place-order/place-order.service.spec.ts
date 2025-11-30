import { BadRequestException } from '@nestjs/common';
import { PlaceOrderService } from './place-order.service';

describe('PlaceOrderService', () => {
  let service: PlaceOrderService;
  const mockOrderRepo: any = { create: jest.fn(), save: jest.fn() };
  const mockProductRepo: any = { findOne: jest.fn(), save: jest.fn() };

  beforeEach(() => {
    mockOrderRepo.create.mockReset();
    mockOrderRepo.save.mockReset();
    mockProductRepo.findOne.mockReset();
    mockProductRepo.save.mockReset();

    service = new PlaceOrderService(mockOrderRepo, mockProductRepo);
  });

  it('places an order successfully when products exist and stock is sufficient', async () => {
    const dto: any = {
      customerName: 'A',
      email: 'a@a.com',
      phone: '0123',
      shippingAddress: 'addr',
      city: 'Hanoi',
      items: [{ productId: 1, quantity: 2 }],
    };

    const prod = { id: 1, currentPrice: 100000, weight: 1, quantity: 5, title: 'P' } as any;
    mockProductRepo.findOne.mockResolvedValue(prod);
    mockProductRepo.save.mockImplementation(async (p: any) => p);
    mockOrderRepo.create.mockReturnValue({ ...dto });
    mockOrderRepo.save.mockImplementation(async (o: any) => ({ id: 10, ...o }));

    const res = await service.placeOrder(dto);

    expect(mockProductRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
    expect(res).toHaveProperty('id', 10);
    expect(prod.quantity).toBe(3); // decreased by 2 and saved
  });

  it('throws when product not found', async () => {
    const dto: any = { items: [{ productId: 999, quantity: 1 }] };
    mockProductRepo.findOne.mockResolvedValue(undefined);
    await expect(service.placeOrder(dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when product out of stock', async () => {
    const dto: any = { items: [{ productId: 2, quantity: 10 }] };
    const prod = { id: 2, currentPrice: 100, weight: 1, quantity: 2, title: 'P2' } as any;
    mockProductRepo.findOne.mockResolvedValue(prod);
    await expect(service.placeOrder(dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('calculates fees only', async () => {
    const dto: any = { city: 'HCMC', items: [{ productId: 3, quantity: 2 }] };
    const prod = { id: 3, currentPrice: 50000, weight: 2 } as any;
    mockProductRepo.findOne.mockResolvedValue(prod);

    const fees = await service.calculateFeesOnly(dto);
    expect(fees).toHaveProperty('subtotal', 100000);
    expect(fees).toHaveProperty('vatAmount', 10000);
    expect(fees).toHaveProperty('currency', 'VND');
  });
});
