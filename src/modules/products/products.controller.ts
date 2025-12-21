import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProductType } from './entities/base-product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiResponse({ status: 200, description: 'Create succesful!' })
  @ApiResponse({ status: 400, description: 'Create failed!' })
  create(@Body() dto: any) {
      return this.productsService.create(dto);
    }

  @Get()
  @ApiResponse({ status: 200, description: 'Get succesful!' })
  @ApiResponse({ status: 400, description: 'Get failed!' })
  findAll(
    @Query('search') search: string,
    @Query('category') category: string,
  ) {
    return this.productsService.findAll(search, category);
  }

  @Get(':id/:type')
  @ApiResponse({ status: 200, description: 'Get succesful!' })
  @ApiResponse({ status: 400, description: 'Get failed!' })
  findOne(
    @Param('id') id: string, 
    @Param('type') type: ProductType
  ) {
    return this.productsService.findOne(+id, type);
  }

  @Patch(':id')
  @ApiBody({ })
  @ApiResponse({ status: 200, description: 'Update successful!' })
  @ApiResponse({ status: 400, description: 'Update failed!' })
  update(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.productsService.update(+id, dto);
  }
  
  @Delete(':id/:type')
  @ApiResponse({ status: 200, description: 'Delete succesful!' })
  @ApiResponse({ status: 400, description: 'Delete failed!' })
  remove(
    @Param('id') id: string,
    @Param('type') type: ProductType
  ) {
    return this.productsService.remove(+id, type);
  }
}
