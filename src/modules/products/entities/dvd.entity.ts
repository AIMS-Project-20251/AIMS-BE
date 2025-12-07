import { Entity, Column } from 'typeorm';
import { BaseProduct, ProductType } from './base-product.entity';

export enum DiscType {
  BLURAY = 'BLURAY',
  HD_DVD = 'HD_DVD',
}

@Entity('dvds')
export class DVD extends BaseProduct {
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

  @Column('simple-array')
  subtitles: string[];

  // Optional
  @Column({ type: 'date', nullable: true })
  releaseDate?: Date;

  @Column({ nullable: true })
  genre?: string;

  constructor() {
    super();
    this.type = ProductType.DVD;
  }
}
