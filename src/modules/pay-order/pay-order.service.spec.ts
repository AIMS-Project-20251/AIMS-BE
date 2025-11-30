import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';

describe('PayOrderService', () => {
  let service: PayOrderService;
  const mockOrderRepo: any = { findOne: jest.fn(), save: jest.fn() };
  const mockPaymentRepo: any = { findOne: jest.fn(), save: jest.fn() };
  const mockPaypalStrategy: any = { createPaymentRequest: jest.fn(), refundPayment: jest.fn() };
  const mockVietqrStrategy: any = { createPaymentRequest: jest.fn() };

  beforeEach(() => {
    mockOrderRepo.findOne.mockReset();
    mockOrderRepo.save.mockReset();
    mockPaymentRepo.findOne.mockReset();
    mockPaymentRepo.save.mockReset();
    mockPaypalStrategy.createPaymentRequest.mockReset();
    mockVietqrStrategy.createPaymentRequest.mockReset();

    service = new PayOrderService(
      mockOrderRepo,
      mockPaymentRepo,
      mockPaypalStrategy,
      mockVietqrStrategy,
    );
  });

  it('initiates a VIETQR payment when order exists and method is VIETQR', async () => {
    const fakeOrder = { id: 1, status: 'CREATED', items: [] } as any;
    mockOrderRepo.findOne.mockResolvedValue(fakeOrder);
    mockVietqrStrategy.createPaymentRequest.mockResolvedValue({ url: 'vqr' });

    const res = await service.initiatePayment(1, 'VIETQR');

    expect(mockOrderRepo.findOne).toHaveBeenCalled();
    expect(mockVietqrStrategy.createPaymentRequest).toHaveBeenCalledWith(fakeOrder);
    expect(res).toEqual({ url: 'vqr' });
  });

  it('throws when order not found', async () => {
    mockOrderRepo.findOne.mockResolvedValue(undefined);
    await expect(service.initiatePayment(999, 'VIETQR')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when unsupported method', async () => {
    const fakeOrder = { id: 2, status: 'CREATED', items: [] } as any;
    mockOrderRepo.findOne.mockResolvedValue(fakeOrder);
    // @ts-ignore - call with unsupported method
    await expect(service.initiatePayment(2, 'UNKNOWN')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms paypal transaction and updates payment and order', async () => {
    const fakeOrder = { id: 5, status: 'CREATED' } as any;
    const fakePayment: any = { transactionId: 'tx1', method: 'PAYPAL', status: 'PENDING', order: fakeOrder };
    mockPaymentRepo.findOne.mockResolvedValue(fakePayment);
    mockPaymentRepo.save.mockImplementation(async (p: any) => p);
    mockOrderRepo.save.mockImplementation(async (o: any) => o);

    await service.confirmPaypalTransaction('tx1');

    expect(mockPaymentRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { transactionId: 'tx1', method: 'PAYPAL' }, relations: ['order'] }));
    expect(fakePayment.status).toBe('COMPLETED');
    expect(fakeOrder.status).toBe('PAID');
    expect(mockPaymentRepo.save).toHaveBeenCalledWith(fakePayment);
    expect(mockOrderRepo.save).toHaveBeenCalledWith(fakeOrder);
  });

  it('confirm paypal throws NotFound when payment missing', async () => {
    mockPaymentRepo.findOne.mockResolvedValue(undefined);
    await expect(service.confirmPaypalTransaction('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
