import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceOrderService } from './place-order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from '../products/products.module';
import { PlaceOrderController } from './place-order.controller';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Common coupling
* - With which class: `Order`, `OrderItem`, `ProductsModule`
* - Reason: Module groups related providers and imports other modules and entities; it couples with TypeORM entities and the products module to access product-related functionality.
*
* 2. COHESION:
* - Level: Procedural cohesion
* - Between components: module imports/exports and provider registration
* - Reason: The module's role is composition and wiring of order-related components; it coordinates them rather than implementing business rules itself.
* ---------------------------------------------------------
*/
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
  ],
  controllers: [PlaceOrderController],
  providers: [PlaceOrderService],
  exports: [TypeOrmModule]
})
export class PlaceOrderModule {}
