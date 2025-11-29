import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiResponse({status: 200, description: "Create succesful!"})
  @ApiResponse({status: 400, description: "Create failed!"})
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiResponse({status: 200, description: "Get succesful!"})
  @ApiResponse({status: 400, description: "Get failed!"})
  findAll(@Query('search') search: string, @Query('category') category: string) {
    return this.productsService.findAll(search, category);
  }

  @Get(':id')
  @ApiResponse({status: 200, description: "Get succesful!"})
  @ApiResponse({status: 400, description: "Get failed!"})
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({status: 200, description: "Update succesful!"})
  @ApiResponse({status: 400, description: "Update failed!"})
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @ApiResponse({status: 200, description: "Delete succesful!"})
  @ApiResponse({status: 400, description: "Delete failed!"})
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}