import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { BaseProduct } from './base-product.entity';

@Entity('newspapers')
export class Newspaper {
  @PrimaryColumn()
  id: number; // id from BaseProduct

  @Column()
  editorInChief: string;

  @Column()
  publisher: string;

  @Column({ type: 'date' })
  publicationDate: Date;

  @Column({ nullable: true })
  issueNumber?: string;

  @Column({ nullable: true })
  publicationFrequency?: string;

  @Column({ nullable: true })
  issn?: string;

  @Column({ nullable: true })
  language?: string;

  // SQL script specified TEXT for sections
  @Column('simple-array', { nullable: true })
  sections?: string[];

  @OneToOne(() => BaseProduct, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  baseProduct: BaseProduct;
}