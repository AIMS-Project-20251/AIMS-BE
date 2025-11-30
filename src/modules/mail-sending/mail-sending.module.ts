import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Order } from '../place-order/entities/order.entity';
import { OrderItem } from '../place-order/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { MailSendingService } from './mail-sending.service';
import { MailSendingController } from './mail-sending.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: "bang.nq189@gmail.com",
          pass: "skee fkiu zqmk pvdk", 
        },
      },
      template: {
        dir: join(__dirname, '..', '..', 'templates'), 
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [MailSendingController],
  providers: [MailSendingService],
  exports: [MailSendingService]
})
export class MailSendingModule {}