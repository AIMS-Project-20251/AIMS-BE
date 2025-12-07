import { Entity, Column } from 'typeorm';
import { BaseProduct, ProductType } from './base-product.entity';

export class Track {
  title: string;
  length: string;
}

@Entity('cds')
export class CD extends BaseProduct {
  @Column()
  artists: string;

  @Column()
  recordLabel: string;

  @Column('json')
  tracks: Track[];

  @Column()
  genre: string;

  // Optional
  @Column({ type: 'date', nullable: true })
  releaseDate?: Date;

  constructor() {
    super();
    this.type = ProductType.CD;
  }
}
