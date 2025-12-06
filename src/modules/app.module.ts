import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '../libs/typeorm.config';
import { ProductsModule } from './products/products.module';
import { PlaceOrderModule } from './place-order/place-order.module';
import { PayOrderModule } from './pay-order/pay-order.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { MailSenderModule } from './mail-sender/mail-sender.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
     TypeOrmModule.forRoot({
      ...dataSource.options,
      autoLoadEntities: true,
    }),
    ProductsModule,
    PlaceOrderModule,
    PayOrderModule,
    HealthCheckModule,
    MailSenderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
