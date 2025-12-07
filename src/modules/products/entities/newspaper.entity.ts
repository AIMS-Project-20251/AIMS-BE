import { Entity, Column } from 'typeorm';
import { BaseProduct, ProductType } from './base-product.entity';

@Entity('newspapers')
export class Newspaper extends BaseProduct {
  @Column()
  editorInChief: string;

  @Column()
  publisher: string;

  @Column({ type: 'date' })
  publicationDate: Date;

  // Optional
  @Column({ nullable: true })
  issueNumber?: string;

  @Column({ nullable: true })
  publicationFrequency?: string;

  @Column({ nullable: true })
  issn?: string;

  @Column({ nullable: true })
  language?: string;

  @Column('simple-array', { nullable: true })
  sections?: string[];

  constructor() {
    super();
    this.type = ProductType.NEWSPAPER;
  }
}
