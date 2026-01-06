import { Injectable, BadRequestException } from '@nestjs/common';
import { PaypalStrategy } from './paypal.strategy';
import { VietqrStrategy } from './vietqr.strategy';
import { PaymentStrategy } from './payment.strategy.interface';

@Injectable()
export class PaymentStrategyFactory {
  private readonly strategies: Record<string, PaymentStrategy> = {};

  constructor(
    private readonly paypalStrategy: PaypalStrategy,
    private readonly vietqrStrategy: VietqrStrategy,
  ) {
    this.strategies['PAYPAL'] = this.paypalStrategy;
    this.strategies['VIETQR'] = this.vietqrStrategy;
  }

  getStrategy(method: string): PaymentStrategy {
    const strategy = this.strategies[method];
    if (!strategy) {
      throw new BadRequestException(`Payment method ${method} is not supported`);
    }
    return strategy;
  }
}