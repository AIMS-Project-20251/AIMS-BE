import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '../libs/typeorm.config';
import { ProductsModule } from './products/products.module';
import { PlaceOrderModule } from './place-order/place-order.module';
import { PayOrderModule } from './pay-order/pay-order.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { MailSendingModule } from './mail-sending/mail-sending.module';

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
    MailSendingModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
