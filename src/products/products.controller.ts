import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseUUIDPipe, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import type { ProductsService } from "./products.service"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import { UserRole } from "../users/entities/user.entity"

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: "Create a new product (Vendor only)" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth()
  create(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.productsService.create(createProductDto, req.user)
  }

  @ApiOperation({ summary: "Get all products with filtering and pagination" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "category", required: false, type: String })
  @ApiQuery({ name: "vendor", required: false, type: String })
  @ApiQuery({ name: "minPrice", required: false, type: Number })
  @ApiQuery({ name: "maxPrice", required: false, type: Number })
  @ApiQuery({ name: "featured", required: false, type: Boolean })
  @ApiQuery({ name: "onSale", required: false, type: Boolean })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["ASC", "DESC"] })
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('vendor') vendor?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('featured') featured?: boolean,
    @Query('onSale') onSale?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.productsService.findAll({
      page,
      limit,
      search,
      category,
      vendor,
      minPrice,
      maxPrice,
      featured,
      onSale,
      sortBy,
      sortOrder,
    })
  }

  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @ApiOperation({ summary: "Update a product (Vendor only)" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    return this.productsService.update(id, updateProductDto, req.user)
  }

  @ApiOperation({ summary: "Delete a product (Vendor only)" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(UserRole.VENDOR)
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.productsService.remove(id, req.user)
  }
}

