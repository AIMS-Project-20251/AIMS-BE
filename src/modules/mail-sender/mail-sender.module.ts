import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Order } from '../place-order/entities/order.entity';
import { OrderItem } from '../place-order/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { MailSenderService } from './mail-sender.service';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Common coupling
* - With which class: `Order`, `OrderItem`, `Product`, `MailerModule`
* - Reason: Module configures the mailer and registers the `MailSenderService`, importing entities needed for email content generation.
*
* 2. COHESION:
* - Level: Procedural cohesion
* - Between components: mailer configuration and DI bindings
* - Reason: The module's purpose is to provide mail-sending capabilities and register required providers, so its composition is cohesive.
* ---------------------------------------------------------
*/
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
  providers: [MailSenderService],
  exports: [MailSenderService]
})
export class MailSenderModule {}
