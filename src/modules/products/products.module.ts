import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/role.guard';

/*
* MODULE DESIGN EVALUATION
* ---------------------------------------------------------
* 1. COUPLING:
* - Level: Common coupling
* - With which class: `Product` entity, `JwtAuthGuard`, `RolesGuard`
* - Reason: The module wires product-related providers, registers guards and imports TypeORM feature entities; it coordinates multiple components.
*
* 2. COHESION:
* - Level: Procedural cohesion
* - Between components: imports, controllers, providers
* - Reason: The module groups product functionality and related infrastructure (auth guards), serving composition responsibilities.
* ---------------------------------------------------------
*/
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
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
