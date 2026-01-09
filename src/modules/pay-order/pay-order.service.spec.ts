import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { OrderStatus } from '../place-order/entities/order.entity';

describe('PayOrderService', () => {
  let service: PayOrderService;

  const mockOrderRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockProductStrategy = {
    findOne: jest.fn(),
  };

  const mockProductsStrategies = {
    BOOK: mockProductStrategy,
  };

  const mockPaymentStrategy = {
    createPaymentRequest: jest.fn(),
    verifyTransaction: jest.fn(),
    refundTransaction: jest.fn(),
  };

  const mockPaymentStrategyFactory = {
    getStrategy: jest.fn(),
  };

  const mockMailSenderService = {
    sendOrderSuccessEmail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new PayOrderService(
      mockOrderRepo as any,
      mockPaymentRepo as any,
      mockProductsStrategies as any,
      mockPaymentStrategyFactory as any,
      mockMailSenderService as any,
    );
  });

  it('initiates VIETQR payment successfully', async () => {
    const fakeOrder: any = {
      id: 1,
      status: OrderStatus.CREATED,
      items: [
        { productId: 10, productType: 'BOOK' },
      ],
    };

    mockOrderRepo.findOne.mockResolvedValue(fakeOrder);
    mockProductStrategy.findOne.mockResolvedValue({ id: 10 });
    mockPaymentStrategyFactory.getStrategy.mockReturnValue(mockPaymentStrategy);
    mockPaymentStrategy.createPaymentRequest.mockResolvedValue({ url: 'vietqr-url' });

    const res = await service.initiatePayment(1, 'VIETQR');

    expect(mockOrderRepo.findOne).toHaveBeenCalled();
    expect(mockProductStrategy.findOne).toHaveBeenCalledWith(10);
    expect(mockPaymentStrategyFactory.getStrategy).toHaveBeenCalledWith('VIETQR');
    expect(res).toEqual({ url: 'vietqr-url' });
  });

  it('throws when order not found', async () => {
    mockOrderRepo.findOne.mockResolvedValue(undefined);

    await expect(
      service.initiatePayment(999, 'VIETQR'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when payment method is unsupported (UT007)', async () => {
    const fakeOrder: any = {
      id: 1,
      status: OrderStatus.CREATED,
      items: [{ productId: 10, productType: 'BOOK' }],
    };

    mockOrderRepo.findOne.mockResolvedValue(fakeOrder);
    mockProductStrategy.findOne.mockResolvedValue({ id: 10 });

    mockPaymentStrategyFactory.getStrategy.mockImplementation(() => {
      throw new BadRequestException('Payment method UNKNOWN is not supported');
    });

    await expect(
      service.initiatePayment(1, 'UNKNOWN'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when product type unsupported', async () => {
    const fakeOrder: any = {
      id: 1,
      status: OrderStatus.CREATED,
      items: [{ productId: 1, productType: 'UNKNOWN' }],
    };

    mockOrderRepo.findOne.mockResolvedValue(fakeOrder);

    await expect(
      service.initiatePayment(1, 'VIETQR'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms transaction and updates payment & order', async () => {
    const fakeOrder: any = { id: 5, status: OrderStatus.CREATED };
    const fakePayment: any = {
      transactionId: 'tx1',
      method: 'PAYPAL',
      status: 'PENDING',
      order: fakeOrder,
    };

    mockPaymentRepo.findOne.mockResolvedValue(fakePayment);
    mockPaymentStrategyFactory.getStrategy.mockReturnValue(mockPaymentStrategy);
    mockPaymentStrategy.verifyTransaction.mockResolvedValue(true);

    await service.confirmTransaction('tx1');

    expect(fakePayment.status).toBe('COMPLETED');
    expect(fakeOrder.status).toBe(OrderStatus.PAID);
    expect(mockPaymentRepo.save).toHaveBeenCalledWith(fakePayment);
    expect(mockOrderRepo.save).toHaveBeenCalledWith(fakeOrder);
    expect(mockMailSenderService.sendOrderSuccessEmail).toHaveBeenCalledWith(5);
  });

  it('throws NotFound when payment missing', async () => {
    mockPaymentRepo.findOne.mockResolvedValue(undefined);

    await expect(
      service.confirmTransaction('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cancels transaction successfully', async () => {
    const fakePayment: any = { transactionId: 'tx2', status: 'PENDING' };
    mockPaymentRepo.findOne.mockResolvedValue(fakePayment);

    const res = await service.cancelTransaction('tx2');

    expect(fakePayment.status).toBe('CANCELLED');
    expect(mockPaymentRepo.save).toHaveBeenCalledWith(fakePayment);
    expect(res).toEqual({ success: true });
  });
});
