import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProductType {
  BOOK = 'BOOK',
  CD = 'CD',
  DVD = 'DVD',
  NEWSPAPER = 'NEWSPAPER',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column('decimal')
  originalValue: number;

  @Column('decimal')
  currentPrice: number;

  @Column()
  quantity: number;

  @Column()
  imageUrl: string;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @Column('float')
  weight: number;

  @Column('json', { nullable: true })
  attributes: any; 

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Data coupling
* - With which class: repositories, `CartItem`, `OrderItem`
* - Reason: Entity is a data contract used across services and relations (cart/order items); it couples via data shapes and DB mappings.
*
* 2. COHESION:
* - Level: Communicational cohesion
* - Between components: all product properties (title, price, quantity, type, attributes)
* - Reason: Fields capture the complete state of a product; the class is a cohesive data model.
* ---------------------------------------------------------
*/