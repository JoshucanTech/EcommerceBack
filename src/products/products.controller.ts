import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
  Req,
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger"
import type { Express } from "express"

import type { ProductsService } from "./products.service"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@prisma/client"

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product (Vendor or Admin only)" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    const vendorId = req.user.role === Role.ADMIN ? createProductDto.vendorId : req.user.vendor.id

    return this.productsService.create(vendorId, createProductDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiQuery({ name: "vendorId", required: false })
  @ApiQuery({ name: "categoryId", required: false })
  @ApiQuery({ name: "isActive", type: Boolean, required: false })
  @ApiQuery({ name: "isFeatured", type: Boolean, required: false })
  @ApiQuery({ name: "minPrice", type: Number, required: false })
  @ApiQuery({ name: "maxPrice", type: Number, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "skip", type: Number, required: false })
  @ApiQuery({ name: "take", type: Number, required: false })
  @ApiQuery({ name: "orderBy", required: false })
  @ApiQuery({ name: "orderDirection", enum: ["asc", "desc"], required: false })
  @ApiResponse({ status: 200, description: "List of products" })
  async findAll(
    @Query('vendorId') vendorId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
  ) {
    const products = await this.productsService.findAll({
      vendorId,
      categoryId,
      isActive,
      isFeatured,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      search,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      orderBy,
      orderDirection,
    })

    const count = await this.productsService.count({
      vendorId,
      categoryId,
      isActive,
      isFeatured,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      search,
    })

    return {
      data: products,
      meta: {
        total: count,
        skip: skip ? +skip : 0,
        take: take ? +take : products.length,
      },
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update product (Vendor or Admin only)" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product (Vendor or Admin only)' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }

  @Post(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor("images", 10))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiOperation({ summary: "Upload product images (Vendor or Admin only)" })
  @ApiResponse({ status: 200, description: "Images uploaded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async uploadImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    return this.productsService.uploadImages(id, files)
  }

  @Delete(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove product image (Vendor or Admin only)" })
  @ApiResponse({ status: 200, description: "Image removed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async removeImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.productsService.removeImage(id, imageUrl)
  }
}

