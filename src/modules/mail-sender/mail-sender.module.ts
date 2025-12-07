import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { Order } from '../place-order/entities/order.entity';
import { OrderItem } from '../place-order/entities/order-item.entity';

import { Book } from '../products/entities/book.entity';
import { CD } from '../products/entities/cd.entity';
import { DVD } from '../products/entities/dvd.entity';
import { Newspaper } from '../products/entities/newspaper.entity';

import { MailSenderService } from './mail-sender.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Book,
      CD,
      DVD,
      Newspaper
    ]),
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
  exports: [MailSenderService],
})
export class MailSenderModule {}
