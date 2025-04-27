import { Injectable, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import type { Product } from "@prisma/client"
import type { StorageService } from "../common/services/storage.service"
import type { Express } from "express"

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Create a new product
   * @param vendorId Vendor ID
   * @param createProductDto Product creation data
   * @returns The created product
   */
  async create(vendorId: string, createProductDto: CreateProductDto): Promise<Product> {
    const { images, ...productData } = createProductDto

    // Generate slug from name if not provided
    if (!productData.slug) {
      productData.slug = this.generateSlug(productData.name)
    }

    // Create the product
    return this.prisma.product.create({
      data: {
        ...productData,
        vendorId,
        images: images || [],
      },
    })
  }

  /**
   * Find all products with optional filtering
   * @param options Query options
   * @returns Array of products
   */
  async findAll(options?: {
    vendorId?: string
    categoryId?: string
    isActive?: boolean
    isFeatured?: boolean
    minPrice?: number
    maxPrice?: number
    search?: string
    skip?: number
    take?: number
    orderBy?: string
    orderDirection?: "asc" | "desc"
  }): Promise<Product[]> {
    const {
      vendorId,
      categoryId,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      search,
      skip,
      take,
      orderBy = "createdAt",
      orderDirection = "desc",
    } = options || {}

    return this.prisma.product.findMany({
      where: {
        ...(vendorId && { vendorId }),
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      skip,
      take,
      orderBy: {
        [orderBy]: orderDirection,
      },
      include: {
        vendor: true,
        category: true,
      },
    })
  }

  /**
   * Find a product by ID
   * @param id Product ID
   * @returns The found product or null
   */
  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
        category: true,
        reviews: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
  }

  /**
   * Find a product by slug
   * @param slug Product slug
   * @returns The found product or null
   */
  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        vendor: true,
        category: true,
        reviews: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
  }

  /**
   * Update a product
   * @param id Product ID
   * @param updateProductDto Product update data
   * @returns The updated product
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id)
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    })
  }

  /**
   * Delete a product
   * @param id Product ID
   * @returns The deleted product
   */
  async remove(id: string): Promise<Product> {
    const product = await this.findById(id)
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return this.prisma.product.delete({
      where: { id },
    })
  }

  /**
   * Count products with optional filtering
   * @param options Query options
   * @returns Number of products
   */
  async count(options?: {
    vendorId?: string
    categoryId?: string
    isActive?: boolean
    isFeatured?: boolean
    minPrice?: number
    maxPrice?: number
    search?: string
  }): Promise<number> {
    const { vendorId, categoryId, isActive, isFeatured, minPrice, maxPrice, search } = options || {}

    return this.prisma.product.count({
      where: {
        ...(vendorId && { vendorId }),
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    })
  }

  /**
   * Upload product images
   * @param id Product ID
   * @param files Image files
   * @returns The updated product
   */
  async uploadImages(id: string, files: Express.Multer.File[]): Promise<Product> {
    const product = await this.findById(id)
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    const uploadedImages = await Promise.all(
      files.map((file) =>
        this.storageService.uploadFile(file.buffer, {
          filename: `${Date.now()}-${file.originalname}`,
          folder: `products/${id}`,
          mimetype: file.mimetype,
        }),
      ),
    )

    return this.prisma.product.update({
      where: { id },
      data: {
        images: [...product.images, ...uploadedImages],
      },
    })
  }

  /**
   * Remove a product image
   * @param id Product ID
   * @param imageUrl Image URL to remove
   * @returns The updated product
   */
  async removeImage(id: string, imageUrl: string): Promise<Product> {
    const product = await this.findById(id)
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Remove the image from storage
    await this.storageService.deleteFile(imageUrl)

    // Remove the image URL from the product
    const updatedImages = product.images.filter((img) => img !== imageUrl)

    return this.prisma.product.update({
      where: { id },
      data: {
        images: updatedImages,
      },
    })
  }

  /**
   * Generate a slug from a product name
   * @param name Product name
   * @returns Generated slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }
}

