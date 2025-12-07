import { IsOptional } from "class-validator";
import { Order } from "src/modules/place-order/entities/order.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `Order` entity, repositories
* - Reason: Entity represents payment records tied to orders and is persisted; other services reference it.
*
* 2. COHESION:
* - Level: Communicational cohesion
* - Between components: `method`, `transactionId`, `amount`, `status`, `order`
* - Reason: Fields together describe a payment record; the class is a cohesive data model for payments.
* ---------------------------------------------------------
*/

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
