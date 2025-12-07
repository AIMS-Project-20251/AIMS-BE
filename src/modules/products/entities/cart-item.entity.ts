import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (order) => order.items)
  cart: Cart;

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
* - With which class: `Cart`, `Product`
* - Reason: Line-item entity that references cart and product entities; used by persistence layer.
*
* 2. COHESION:
* - Level: Functional cohesion
* - Between components: `cart`, `product`, `quantity`, `price`
* - Reason: Fields represent a single line-item concept; the class is tightly focused.
* ---------------------------------------------------------
*/