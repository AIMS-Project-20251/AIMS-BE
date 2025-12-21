import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { BaseProduct } from './base-product.entity';

export enum CoverType {
  PAPERBACK = 'PAPERBACK',
  HARDCOVER = 'HARDCOVER',
}

@Entity('books')
export class Book {
  @PrimaryColumn()
  id: number; // id from BaseProduct

  @Column()
  authors: string;

  @Column({ type: 'enum', enum: CoverType })
  coverType: CoverType;

  @Column()
  publisher: string;

  @Column({ type: 'date' })
  publicationDate: Date;

  @Column({ nullable: true })
  pages?: number;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  genre?: string;

  // Link to the parent table
  @OneToOne(() => BaseProduct, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  baseProduct: BaseProduct;
}