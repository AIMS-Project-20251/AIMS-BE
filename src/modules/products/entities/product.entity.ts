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