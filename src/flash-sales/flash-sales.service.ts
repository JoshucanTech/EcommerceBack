import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { ProductsService } from "../products/products.service"
import type { CreateFlashSaleDto } from "./dto/create-flash-sale.dto"
import type { UpdateFlashSaleDto } from "./dto/update-flash-sale.dto"
import type { AddFlashSaleItemDto } from "./dto/add-flash-sale-item.dto"
import type { FlashSale } from "@prisma/client"

@Injectable()
export class FlashSalesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  /**
   * Create a new flash sale
   * @param createFlashSaleDto Flash sale creation data
   * @returns The created flash sale
   */
  async create(createFlashSaleDto: CreateFlashSaleDto): Promise<FlashSale> {
    return this.prisma.flashSale.create({
      data: createFlashSaleDto,
    })
  }

  /**
   * Find all flash sales with optional filtering
   * @param options Query options
   * @returns Array of flash sales
   */
  async findAll(options?: {
    isActive?: boolean
    skip?: number
    take?: number
  }): Promise<FlashSale[]> {
    const { isActive, skip, take } = options || {}

    return this.prisma.flashSale.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    })
  }

  /**
   * Find a flash sale by ID
   * @param id Flash sale ID
   * @returns The found flash sale or null
   */
  async findOne(id: string): Promise<FlashSale | null> {
    return this.prisma.flashSale.findUnique({
      where: { id },
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
   * Update a flash sale
   * @param id Flash sale ID
   * @param updateFlashSaleDto Flash sale update data
   * @returns The updated flash sale
   */
  async update(id: string, updateFlashSaleDto: UpdateFlashSaleDto): Promise<FlashSale> {
    const flashSale = await this.findOne(id)
    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${id} not found`)
    }

    return this.prisma.flashSale.update({
      where: { id },
      data: updateFlashSaleDto,
    })
  }

  /**
   * Delete a flash sale
   * @param id Flash sale ID
   */
  async remove(id: string): Promise<void> {
    const flashSale = await this.findOne(id)
    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${id} not found`)
    }

    await this.prisma.flashSale.delete({
      where: { id },
    })
  }

  /**
   * Add an item to a flash sale
   * @param flashSaleId Flash sale ID
   * @param addFlashSaleItemDto Flash sale item data
   * @returns The updated flash sale
   */
  async addItem(flashSaleId: string, addFlashSaleItemDto: AddFlashSaleItemDto): Promise<FlashSale> {
    const { productId, discountType, discountValue, quantity } = addFlashSaleItemDto

    // Validate flash sale
    const flashSale = await this.findOne(flashSaleId)
    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${flashSaleId} not found`)
    }

    // Validate product
    const product = await this.productsService.findById(productId)
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    // Check if item already exists in flash sale
    const existingItem = await this.prisma.flashSaleItem.findUnique({
      where: {
        flashSaleId_productId: {
          flashSaleId,
          productId,
        },
      },
    })

    if (existingItem) {
      throw new BadRequestException("Product already exists in flash sale")
    }

    // Add item to flash sale
    await this.prisma.flashSaleItem.create({
      data: {
        flashSaleId,
        productId,
        discountType,
        discountValue,
        quantity,
      },
    })

    return this.findOne(flashSaleId)
  }

  /**
   * Remove an item from a flash sale
   * @param flashSaleId Flash sale ID
   * @param productId Product ID
   */
  async removeItem(flashSaleId: string, productId: string): Promise<FlashSale> {
    // Validate flash sale
    const flashSale = await this.findOne(flashSaleId)
    if (!flashSale) {
      throw new NotFoundException(`Flash sale with ID ${flashSaleId} not found`)
    }

    // Check if item exists in flash sale
    const existingItem = await this.prisma.flashSaleItem.findUnique({
      where: {
        flashSaleId_productId: {
          flashSaleId,
          productId,
        },
      },
    })

    if (!existingItem) {
      throw new NotFoundException("Product does not exist in flash sale")
    }

    // Remove item from flash sale
    await this.prisma.flashSaleItem.delete({
      where: {
        flashSaleId_productId: {
          flashSaleId,
          productId,
        },
      },
    })

    return this.findOne(flashSaleId)
  }
}

