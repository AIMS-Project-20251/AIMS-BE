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