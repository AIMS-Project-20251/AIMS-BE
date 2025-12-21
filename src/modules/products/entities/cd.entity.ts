import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { BaseProduct } from './base-product.entity';

export class Track {
  title: string;
  length: string;
}

@Entity('cds')
export class CD {
  @PrimaryColumn()
  id: number; // id from BaseProduct

  @Column()
  artists: string;

  @Column()
  recordLabel: string;

  // SQL script specified JSONB for cds
  @Column({ type: 'json' }) 
  tracks: Track[];

  @Column()
  genre: string;

  @Column({ type: 'date', nullable: true })
  releaseDate?: Date;

  @OneToOne(() => BaseProduct, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  baseProduct: BaseProduct;
}