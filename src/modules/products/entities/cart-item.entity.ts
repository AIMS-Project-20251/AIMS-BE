import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductType } from './base-product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (order) => order.items)
  cart: Cart;

  @Column()
  productId: number;

  @Column()
  productType: ProductType;

  @Column()
  quantity: number;

  @Column('decimal')
  price: number;
}