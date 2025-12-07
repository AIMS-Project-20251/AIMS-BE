import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;

  @Column('decimal')
  price: number;
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `Order`, `Product`
* - Reason: OrderItem represents a join between orders and products; it carries references to both entities and is persisted by TypeORM.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: fields `order`, `product`, `quantity`, `price`
* - Reason: All properties directly describe a single concept: a line item in an order. The class is narrowly focused and cohesive.
* ---------------------------------------------------------
*/