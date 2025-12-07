import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from 'src/modules/pay-order/entities/payment.entity';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `OrderItem`, `Payment` (and repositories that persist them)
* - Reason: Entity defines relations to `OrderItem` and `Payment` and is persisted by TypeORM; it is shaped to match database schema and used across services.
*
* 2. COHESION:
* - Level: Communicational cohesion
* - Between components: entity properties (customerName, items, payments, amounts, status)
* - Reason: All fields represent the state of an order and are used together when processing or querying orders; the class is a cohesive data structure.
* ---------------------------------------------------------
*/

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  shippingAddress: string;

  @Column()
  city: string;

  @Column('decimal')
  subtotal: number;

  @Column('decimal')
  vatAmount: number;

  @Column('decimal')
  shippingFee: number;

  @Column('decimal')
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, payment => payment.order, { cascade: true })
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;
}
