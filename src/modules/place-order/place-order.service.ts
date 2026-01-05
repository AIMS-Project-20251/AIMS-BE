import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { ShippingCalculator } from './shipping.calculator';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  BaseProduct,
  ProductType,
} from '../products/entities/base-product.entity';
import { ProductsStrategy } from '../products/strategies/products.strategy.interface';
import { PRODUCT_STRATEGIES } from '../products/constants/product-strategies.token';

@Injectable()
export class PlaceOrderService {
  constructor(
    @Inject(PRODUCT_STRATEGIES)
    private readonly productsStrategies: Record<ProductType, ProductsStrategy>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async placeOrder(dto: CreateOrderDto) {
    let subtotal = 0;
    let totalWeight = 0;
    const orderItems: {
      productId: number;
      productType: ProductType;
      quantity: number;
      price: number;
    }[] = [];

    for (const itemDto of dto.items) {
      const strategy = this.productsStrategies[itemDto.type];
      if (!strategy) {
        throw new BadRequestException(
          `Product type ${itemDto.type} does not exist`,
        );
      }
      const product = await strategy.findOne(itemDto.productId);
      if (!product) {
        throw new BadRequestException(
          `Product ID ${itemDto.productId} of type ${itemDto.type} not found`,
        );
      }

      if (product.quantity < itemDto.quantity) {
        throw new BadRequestException(
          `Product ${product.title} is out of stock`,
        );
      }

      if (product.isActive === false) {
        throw new BadRequestException(
          `Product ${product.title} is not available for sale`,
        );
      }

      product.quantity -= itemDto.quantity;
      await strategy.update(product.id, product);

      subtotal += Number(product.currentPrice) * itemDto.quantity;
      totalWeight += Number(product.weight) * itemDto.quantity;

      orderItems.push({
        productId: product.id,
        productType: itemDto.type,
        quantity: itemDto.quantity,
        price: product.currentPrice,
      });
    }

    const vatAmount = subtotal * 0.1;
    const shippingFee = ShippingCalculator.calculate(
      totalWeight,
      dto.city,
      subtotal,
    );
    const totalAmount = subtotal + vatAmount + shippingFee;

    const order = this.orderRepo.create({
      customerName: dto.customerName,
      email: dto.email,
      phone: dto.phone,
      shippingAddress: dto.shippingAddress,
      city: dto.city,
      subtotal,
      vatAmount,
      shippingFee,
      totalAmount,
      status: OrderStatus.CREATED,
      items: orderItems,
    });

    return this.orderRepo.save(order);
  }

  async calculateFeesOnly(dto: CreateOrderDto) {
    let subtotal = 0;
    let totalWeight = 0;

    for (const itemDto of dto.items) {
      const strategy = this.productsStrategies[itemDto.type];
      if (!strategy) {
        throw new BadRequestException(
          `Product type ${itemDto.type} does not exist`,
        );
      }
      const product = await strategy.findOne(itemDto.productId);
      if (!product) {
        throw new BadRequestException(
          `Product ID ${itemDto.productId} of type ${itemDto.type} not found`,
        );
      }

      subtotal += Number(product.currentPrice) * itemDto.quantity;
      totalWeight += Number(product.weight) * itemDto.quantity;
    }

    const shippingFee = ShippingCalculator.calculate(
      totalWeight,
      dto.city,
      subtotal,
    );
    const vatAmount = subtotal * 0.1;
    const totalAmount = subtotal + vatAmount + shippingFee;

    return {
      subtotal,
      vatAmount,
      shippingFee,
      totalAmount,
      currency: 'VND',
    };
  }

  async checkStatus(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestException(`Order ${orderId} not found`);
    }

    return { status: order.status };
  }
}
