import { Entity, Column } from 'typeorm';
import { BaseProduct, ProductType } from './base-product.entity';

export enum CoverType {
  PAPERBACK = 'PAPERBACK',
  HARDCOVER = 'HARDCOVER',
}

@Entity('books')
export class Book extends BaseProduct {
  @Column()
  authors: string; // hoặc string[] nếu bạn muốn list

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

  constructor() {
    super();
    this.type = ProductType.BOOK;
  }
}
