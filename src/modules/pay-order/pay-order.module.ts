import { Module } from '@nestjs/common';
import { PayOrderService } from './pay-order.service';
import { PayOrderController } from './pay-order.controller';
import { PaypalStrategy } from './strategies/paypal.strategy';
import { VietqrStrategy } from './strategies/vietqr.strategy';
import { PlaceOrderModule } from '../place-order/place-order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { MailSenderModule } from '../mail-sender/mail-sender.module';
import { MailSenderService } from '../mail-sender/mail-sender.service';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Common coupling
* - With which class: `Payment` entity, `PlaceOrderModule`, `MailSenderModule`, strategy providers
* - Reason: Module composes payment-related services and strategies and imports dependencies needed for persistence and mail sending.
*
* 2. COHESION:
* - Level: Procedural cohesion
* - Between components: imports, controllers, providers
* - Reason: The module groups payment orchestration pieces and registers providers for DI; its purpose is composition.
* ---------------------------------------------------------
*/
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    PlaceOrderModule,
    MailSenderModule
  ],
  controllers: [PayOrderController],
  providers: [
    PayOrderService, 
    PaypalStrategy, 
    VietqrStrategy,
    MailSenderService,
  ],
})
export class PayOrderModule {}
