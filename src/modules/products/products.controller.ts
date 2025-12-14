import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProductType } from './entities/base-product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiResponse({ status: 200, description: 'Create succesful!' })
  @ApiResponse({ status: 400, description: 'Create failed!' })
  create(@Body() createProductDto: CreateProductDto) {
    switch (createProductDto.type) {
      case ProductType.BOOK:
        return this.productsService.createBook(createProductDto);
      case ProductType.CD:
        return this.productsService.createCD(createProductDto);
      case ProductType.DVD:
        return this.productsService.createDVD(createProductDto);
      case ProductType.NEWSPAPER:
        return this.productsService.createNewspaper(createProductDto);
      default:
        throw new BadRequestException(`Unknown product type: ${createProductDto['type']}`);
    }
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
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Update successful!' })
  @ApiResponse({ status: 400, description: 'Update failed!' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    switch (updateProductDto.type) {
      case ProductType.BOOK:
        return this.productsService.updateBook(+id, updateProductDto);
      case ProductType.CD:
        return this.productsService.updateCD(+id, updateProductDto);
      case ProductType.DVD:
        return this.productsService.updateDVD(+id, updateProductDto);
      case ProductType.NEWSPAPER:
        return this.productsService.updateNewspaper(+id, updateProductDto);
      default:
        throw new BadRequestException(`Unknown product type: ${updateProductDto['type']}`);
    }
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
