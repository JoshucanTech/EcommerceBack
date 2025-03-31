import { Injectable, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateCategoryDto } from "./dto/create-category.dto"
import type { UpdateCategoryDto } from "./dto/update-category.dto"
import type { Category } from "@prisma/client"
import type { StorageService } from "../common/services/storage.service"
import type { Express } from "express"

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Create a new category
   * @param createCategoryDto Category creation data
   * @returns The created category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, description, parentId, isActive, image } = createCategoryDto

    // Generate slug from name if not provided
    const slug = createCategoryDto.slug || this.generateSlug(name)

    return this.prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        isActive,
        image,
      },
    })
  }

  /**
   * Find all categories with optional filtering
   * @param options Query options
   * @returns Array of categories
   */
  async findAll(options?: {
    parentId?: string
    isActive?: boolean
    search?: string
    skip?: number
    take?: number
  }): Promise<Category[]> {
    const { parentId, isActive, search, skip, take } = options || {}

    return this.prisma.category.findMany({
      where: {
        ...(parentId !== undefined ? { parentId } : {}),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        name: "asc",
      },
    })
  }

  /**
   * Find a category by ID
   * @param id Category ID
   * @returns The found category or null
   */
  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
  }

  /**
   * Find a category by slug
   * @param slug Category slug
   * @returns The found category or null
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
  }

  /**
   * Update a category
   * @param id Category ID
   * @param updateCategoryDto Category update data
   * @returns The updated category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id)
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    })
  }

  /**
   * Delete a category
   * @param id Category ID
   * @returns The deleted category
   */
  async remove(id: string): Promise<Category> {
    const category = await this.findById(id)
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return this.prisma.category.delete({
      where: { id },
    })
  }

  /**
   * Count categories with optional filtering
   * @param options Query options
   * @returns Number of categories
   */
  async count(options?: {
    parentId?: string
    isActive?: boolean
    search?: string
  }): Promise<number> {
    const { parentId, isActive, search } = options || {}

    return this.prisma.category.count({
      where: {
        ...(parentId !== undefined ? { parentId } : {}),
        ...(isActive !== undefined && { isActive }),
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
   * Upload category image
   * @param id Category ID
   * @param file Image file
   * @returns The updated category
   */
  async uploadImage(id: string, file: Express.Multer.File): Promise<Category> {
    const category = await this.findById(id)
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    // Delete old image if exists
    if (category.image) {
      await this.storageService.deleteFile(category.image)
    }

    // Upload new image
    const imageUrl = await this.storageService.uploadFile(file.buffer, {
      filename: `${Date.now()}-${file.originalname}`,
      folder: "categories",
      mimetype: file.mimetype,
    })

    return this.prisma.category.update({
      where: { id },
      data: {
        image: imageUrl,
      },
    })
  }

  /**
   * Generate a slug from a category name
   * @param name Category name
   * @returns Generated slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }
}

