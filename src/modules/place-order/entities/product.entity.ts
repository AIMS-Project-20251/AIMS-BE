import { ProductCategory } from "src/utils/enums/enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Double } from "typeorm/browser";


@Entity('product')
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column({type: 'double', nullable: false})
    cost: Double;
    
    @Column({type: 'enum', enum: ProductCategory, nullable: false})
    category: ProductCategory;

    @Column({type: 'text', nullable: false})
    title: String;

    @Column({type: 'text', nullable: false})
    description: String;

    
}