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
import { Book } from '../products/entities/book.entity';
import { CD } from '../products/entities/cd.entity';
import { DVD } from '../products/entities/dvd.entity';
import { Newspaper } from '../products/entities/newspaper.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Book, CD, DVD, Newspaper]),
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