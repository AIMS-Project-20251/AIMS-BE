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
    RolesGuard,],
  exports: [TypeOrmModule],
})
export class ProductsModule { }