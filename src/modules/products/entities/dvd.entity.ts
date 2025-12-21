import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { BaseProduct } from './base-product.entity';

export enum DiscType {
  BLURAY = 'BLURAY',
  HD_DVD = 'HD_DVD',
}

@Entity('dvds')
export class DVD {
  @PrimaryColumn()
  id: number; // id from BaseProduct

  @Column({ type: 'enum', enum: DiscType })
  discType: DiscType;

  @Column()
  director: string;

  @Column()
  runtime: string;

  @Column()
  studio: string;

  @Column()
  language: string;

  // SQL script specified TEXT for subtitles
  @Column('simple-array') 
  subtitles: string[];

  @Column({ type: 'date', nullable: true })
  releaseDate?: Date;

  @Column({ nullable: true })
  genre?: string;

  @OneToOne(() => BaseProduct, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  baseProduct: BaseProduct;
}