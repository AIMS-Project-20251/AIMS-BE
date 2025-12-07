import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { BaseProduct } from './base-product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (order) => order.items)
  cart: Cart;

  @ManyToOne(() => BaseProduct)
  product: BaseProduct;

  @Column()
  quantity: number;

  @Column('decimal')
  price: number;
}