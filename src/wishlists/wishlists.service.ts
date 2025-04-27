import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { ProductsService } from "../products/products.service"
import type { WishlistItem } from "@prisma/client"

@Injectable()
export class WishlistsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  /**
   * Add an item to the wishlist
   * @param userId User ID
   * @param productId Product ID
   * @returns The created wishlist item
   */
  async addItem(userId: string, productId: string): Promise<WishlistItem> {
    // Validate product
    const product = await this.productsService.findById(productId)
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    // Check if item already exists in wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existingItem) {
      throw new BadRequestException("Product already exists in wishlist")
    }

    // Add item to wishlist
    return this.prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
    })
  }

  /**
   * Find all wishlist items for a user
   * @param userId User ID
   * @returns Array of wishlist items
   */
  async findAll(userId: string): Promise<WishlistItem[]> {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  /**
   * Remove an item from the wishlist
   * @param userId User ID
   * @param productId Product ID
   */
  async removeItem(userId: string, productId: string): Promise<void> {
    // Check if item exists in wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (!existingItem) {
      throw new NotFoundException("Product does not exist in wishlist")
    }

    // Remove item from wishlist
    await this.prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })
  }
}

