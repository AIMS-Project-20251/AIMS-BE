import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { ShippingCalculator } from './shipping.calculator';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class PlaceOrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async placeOrder(dto: CreateOrderDto) {
    let subtotal = 0;
    let totalWeight = 0;
    const orderItems: { product: Product; quantity: number; price: number }[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
      
      if (!product) throw new BadRequestException(`Product ${itemDto.productId} not found`);
      if (product.quantity < itemDto.quantity) {
        throw new BadRequestException(`Product ${product.title} is out of stock`);
      }

      product.quantity -= itemDto.quantity;
      await this.productRepo.save(product);

      subtotal += Number(product.currentPrice) * itemDto.quantity;
      totalWeight += Number(product.weight) * itemDto.quantity;

      orderItems.push({
        product: product,
        quantity: itemDto.quantity,
        price: product.currentPrice
      });
    }

    const vatAmount = subtotal * 0.10;
    const shippingFee = ShippingCalculator.calculate(totalWeight, dto.city, subtotal);
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
      items: orderItems
    });

    return this.orderRepo.save(order);
  }

  async calculateFeesOnly(dto: CreateOrderDto) {
    let subtotal = 0;
    let totalWeight = 0;

    for (const itemDto of dto.items) {
      const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
      if (product) {
        subtotal += Number(product.currentPrice) * itemDto.quantity;
        totalWeight += Number(product.weight) * itemDto.quantity;
      }
    }

    const shippingFee = ShippingCalculator.calculate(totalWeight, dto.city, subtotal);
    const vatAmount = subtotal * 0.10;
    const totalAmount = subtotal + vatAmount + shippingFee;

    return {
      subtotal,
      vatAmount,
      shippingFee,
      totalAmount,
      currency: 'VND'
    };
  }
}