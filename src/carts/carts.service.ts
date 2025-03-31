import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { ProductsService } from "../products/products.service"
import type { CreateCartItemDto } from "./dto/create-cart-item.dto"
import type { UpdateCartItemDto } from "./dto/update-cart-item.dto"
import type { Cart } from "@prisma/client"

@Injectable()
export class CartsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  /**
   * Create a new cart
   * @param userId User ID
   * @returns The created cart
   */
  async create(userId: string): Promise<Cart> {
    return this.prisma.cart.create({
      data: { userId },
    })
  }

  /**
   * Find a cart by user ID
   * @param userId User ID
   * @returns The found cart or null
   */
  async findCartByUserId(userId: string): Promise<Cart | null> {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  }

  /**
   * Add an item to the cart
   * @param userId User ID
   * @param createCartItemDto Cart item data
   * @returns The updated cart
   */
  async addItem(userId: string, createCartItemDto: CreateCartItemDto): Promise<Cart> {
    const { productId, quantity } = createCartItemDto

    // Validate cart
    let cart = await this.findCartByUserId(userId)
    if (!cart) {
      cart = await this.create(userId)
    }

    // Validate product
    const product = await this.productsService.findById(productId)
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    if (product.inventory < quantity) {
      throw new BadRequestException(`Not enough inventory for product ${product.name}`)
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      throw new BadRequestException("Product already exists in cart")
    }

    // Add item to cart
    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })

    return this.findCartByUserId(userId)
  }

  /**
   * Update a cart item
   * @param userId User ID
   * @param productId Product ID
   * @param updateCartItemDto Cart item update data
   * @returns The updated cart
   */
  async updateItem(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { quantity } = updateCartItemDto

    // Validate cart
    const cart = await this.findCartByUserId(userId)
    if (!cart) {
      throw new NotFoundException("Cart not found")
    }

    // Validate product
    const product = await this.productsService.findById(productId)
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    if (product.inventory < quantity) {
      throw new BadRequestException(`Not enough inventory for product ${product.name}`)
    }

    // Check if item exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (!existingItem) {
      throw new NotFoundException("Product does not exist in cart")
    }

    // Update item in cart
    await this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity },
    })

    return this.findCartByUserId(userId)
  }

  /**
   * Remove an item from the cart
   * @param userId User ID
   * @param productId Product ID
   * @returns The updated cart
   */
  async removeItem(userId: string, productId: string): Promise<Cart> {
    // Validate cart
    const cart = await this.findCartByUserId(userId)
    if (!cart) {
      throw new NotFoundException("Cart not found")
    }

    // Check if item exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (!existingItem) {
      throw new NotFoundException("Product does not exist in cart")
    }

    // Remove item from cart
    await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    return this.findCartByUserId(userId)
  }

  /**
   * Clear the cart
   * @param userId User ID
   */
  async clear(userId: string): Promise<void> {
    // Validate cart
    const cart = await this.findCartByUserId(userId)
    if (!cart) {
      throw new NotFoundException("Cart not found")
    }

    // Remove all items from cart
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })
  }
}

