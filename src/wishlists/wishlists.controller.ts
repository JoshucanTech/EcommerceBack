import { Controller, Get, Post, Delete, Param, UseGuards, Req, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import type { WishlistsService } from "./wishlists.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("wishlists")
@Controller("wishlists")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post(":productId")
  @ApiOperation({ summary: "Add an item to the wishlist" })
  @ApiResponse({ status: 201, description: "Item added to wishlist successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async addItem(@Param('productId') productId: string, @Req() req) {
    return this.wishlistsService.addItem(req.user.id, productId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all wishlist items for a user' })
  @ApiResponse({ status: 200, description: 'List of wishlist items' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req) {
    return this.wishlistsService.findAll(req.user.id);
  }

  @Delete(":productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove an item from the wishlist" })
  @ApiResponse({ status: 204, description: "Item removed from wishlist successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async removeItem(@Param('productId') productId: string, @Req() req) {
    await this.wishlistsService.removeItem(req.user.id, productId)
  }
}

