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

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Common coupling / Data coupling
* - With which class: `TypeOrmModule`, feature modules like `ProductsModule`, `PlaceOrderModule`, etc.
* - Reason: `AppModule` aggregates and wires multiple modules together and shares configuration objects (common imports). It couples to many modules via imports but does not depend on their internal implementations.
*
* 2. COHESION:
* - Level: Procedural cohesion
* - Between components: module metadata (`imports`, `controllers`, `providers`)
* - Reason: `AppModule` is responsible for application composition and configuration; its parts work together to initialize the application container rather than implement business logic.
* ---------------------------------------------------------
*/
