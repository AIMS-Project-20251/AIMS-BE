import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceOrderService } from './place-order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from '../products/products.module';
import { PlaceOrderController } from './place-order.controller';

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