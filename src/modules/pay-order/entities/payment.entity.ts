import { IsOptional } from "class-validator";
import { Order } from "src/modules/place-order/entities/order.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: 'PAYPAL' | 'VIETQR';

  @Column()
  @IsOptional()
  transactionId?: string;

  @Column('decimal')
  amount: number;

  @Column({ type: 'enum', enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @ManyToOne(() => Order, order => order.payments)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;
}
