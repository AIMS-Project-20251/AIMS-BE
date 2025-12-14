import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { ShippingCalculator } from './shipping.calculator';
import { CreateOrderDto } from './dto/create-order.dto';
import { Book } from '../products/entities/book.entity';
import { CD } from '../products/entities/cd.entity';
import { DVD } from '../products/entities/dvd.entity';
import { Newspaper } from '../products/entities/newspaper.entity';
import { BaseProduct, ProductType } from '../products/entities/base-product.entity';

@Injectable()
export class PlaceOrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(CD) private cdRepo: Repository<CD>,
    @InjectRepository(DVD) private dvdRepo: Repository<DVD>,
    @InjectRepository(Newspaper) private newspaperRepo: Repository<Newspaper>,
  ) { }

  async placeOrder(dto: CreateOrderDto) {
    let subtotal = 0;
    let totalWeight = 0;
    const orderItems: { product: any; quantity: number; price: number }[] = [];

    for (const itemDto of dto.items) {
      const found = await this.findProductEverywhere(itemDto.productId, itemDto.type);

      if (!found) {
        throw new BadRequestException(`Product ${itemDto.productId} not found`);
      }

      const { product, repo } = found;

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
      await repo.save(product);

      subtotal += Number(product.currentPrice) * itemDto.quantity;
      totalWeight += Number(product.weight) * itemDto.quantity;

      orderItems.push({
        product,
        quantity: itemDto.quantity,
        price: product.currentPrice,
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
      items: orderItems,
    });

    return this.orderRepo.save(order);
  }

  async calculateFeesOnly(dto: CreateOrderDto) {
    let subtotal = 0;
    let totalWeight = 0;

    for (const itemDto of dto.items) {
      const found = await this.findProductEverywhere(itemDto.productId, itemDto.type);
      if (!found) continue;

      const { product } = found;

      subtotal += Number(product.currentPrice) * itemDto.quantity;
      totalWeight += Number(product.weight) * itemDto.quantity;
    }

    const shippingFee = ShippingCalculator.calculate(totalWeight, dto.city, subtotal);
    const vatAmount = subtotal * 0.10;
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

  private async findProductEverywhere(id: number, type: ProductType): Promise<{ product: BaseProduct; repo: Repository<BaseProduct> } | null> {
    const repos: Repository<BaseProduct>[] = [
      this.bookRepo as Repository<BaseProduct>,
      this.cdRepo as Repository<BaseProduct>, 
      this.dvdRepo as Repository<BaseProduct>,
      this.newspaperRepo as Repository<BaseProduct>,
    ];

    for (const repo of repos) {
      const product = await repo.findOne({ where: { id, type } });
      if (product) return { product, repo };
    }

    return null;
  }
}
