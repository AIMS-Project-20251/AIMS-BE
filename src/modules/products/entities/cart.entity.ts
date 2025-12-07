import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';


/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: `CartItem`
* - Reason: `Cart` aggregates `CartItem` instances and is persisted; it depends on the item structure for totals.
*
* 2. COHESION:
* - Level: Communicational cohesion
* - Between components: `subtotal`, `totalAmount`, `items`
* - Reason: Properties together describe cart state and are used jointly when processing cart operations.
* ---------------------------------------------------------
*/
@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  subtotal: number;

  @Column('decimal')
  totalAmount: number;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;
}