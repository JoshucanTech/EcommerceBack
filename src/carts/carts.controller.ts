import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import type { CartsService } from "./carts.service"
import type { CreateCartItemDto } from "./dto/create-cart-item.dto"
import type { UpdateCartItemDto } from "./dto/update-cart-item.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("carts")
@Controller("carts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart for current user' })
  @ApiResponse({ status: 200, description: 'Cart details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@Req() req) {
    return this.cartsService.findCartByUserId(req.user.id);
  }

  @Post("items")
  @ApiOperation({ summary: "Add an item to the cart" })
  @ApiResponse({ status: 201, description: "Item added to cart successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async addItem(@Body() createCartItemDto: CreateCartItemDto, @Req() req) {
    return this.cartsService.addItem(req.user.id, createCartItemDto)
  }

  @Patch("items/:productId")
  @ApiOperation({ summary: "Update a cart item" })
  @ApiResponse({ status: 200, description: "Cart item updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Cart or product not found" })
  async updateItem(@Param('productId') productId: string, @Body() updateCartItemDto: UpdateCartItemDto, @Req() req) {
    return this.cartsService.updateItem(req.user.id, productId, updateCartItemDto)
  }

  @Delete("items/:productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an item from the cart" })
  @ApiResponse({ status: 204, description: "Cart item removed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Cart or product not found" })
  async removeItem(@Param('productId') productId: string, @Req() req) {
    await this.cartsService.removeItem(req.user.id, productId)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear the cart' })
  @ApiResponse({ status: 204, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clear(@Req() req) {
    await this.cartsService.clear(req.user.id);
  }
}

