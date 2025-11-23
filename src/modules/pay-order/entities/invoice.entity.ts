import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Order } from '../../place-order/entities/order.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  totalAmount: number;

  @Column()
  paymentMethod: 'PAYPAL' | 'VIETQR';

  @Column()
  transactionId: string;

  @CreateDateColumn()
  issuedAt: Date;

  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;
}