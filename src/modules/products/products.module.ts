import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Book } from './entities/book.entity';
import { CD } from './entities/cd.entity';
import { DVD } from './entities/dvd.entity';
import { Newspaper } from './entities/newspaper.entity';
import { BooksStrategy } from './strategies/books.strategy';
import { CdsStrategy } from './strategies/cds.strategy';
import { DvdsStrategy } from './strategies/dvds.strategy';
import { NewspapersStrategy } from './strategies/newspapers.strategy';
import { PRODUCT_STRATEGIES } from './constants/product-strategies.token';
import { ProductType } from './entities/base-product.entity';
import { ProductsStrategy } from './strategies/products.strategy.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, CD, DVD, Newspaper]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    JwtAuthGuard,
    RolesGuard,
    BooksStrategy,
    CdsStrategy,
    DvdsStrategy,
    NewspapersStrategy,
    {
      provide: PRODUCT_STRATEGIES,
      useFactory: (
        books: BooksStrategy,
        cds: CdsStrategy,
        dvds: DvdsStrategy,
        newspapers: NewspapersStrategy,
      ): Record<ProductType, ProductsStrategy> => ({
        [ProductType.BOOK]: books,
        [ProductType.CD]: cds,
        [ProductType.DVD]: dvds,
        [ProductType.NEWSPAPER]: newspapers,
      }),
      inject: [
        BooksStrategy,
        CdsStrategy,
        DvdsStrategy,
        NewspapersStrategy,
      ],
    },
  ],
  exports: [
    TypeOrmModule,
    PRODUCT_STRATEGIES,
  ],
})
export class ProductsModule { }