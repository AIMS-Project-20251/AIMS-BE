import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

export enum ProductType {
  BOOK = 'BOOK',
  CD = 'CD',
  DVD = 'DVD',
  NEWSPAPER = 'NEWSPAPER',
}

@Entity('base_product')
export class BaseProduct {
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

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}