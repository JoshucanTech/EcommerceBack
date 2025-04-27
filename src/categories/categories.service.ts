import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, In, Not } from "typeorm"
import { Category } from "./entities/category.entity"
import type { CreateCategoryDto } from "./dto/create-category.dto"
import type { UpdateCategoryDto } from "./dto/update-category.dto"
import { slugify } from "../common/utils/slugify.util"

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * Create a new category
   * @param createCategoryDto Category creation data
   * @returns Created category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto

    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData.slug = slugify(categoryData.name)
    }

    // Check if slug already exists
    const existingCategory = await this.categoriesRepository.findOne({
      where: { slug: categoryData.slug },
    })

    if (existingCategory) {
      categoryData.slug = `${categoryData.slug}-${Date.now()}`
    }

    // Create category
    const category = this.categoriesRepository.create(categoryData)

    // Set parent category if provided
    if (parentId) {
      const parentCategory = await this.findOne(parentId)
      category.parent = parentCategory
    }

    return this.categoriesRepository.save(category)
  }

  /**
   * Find all categories with filtering and pagination
   * @param options Filter and pagination options
   * @returns Paginated categories
   */
  async findAll(options: {
    page?: number
    limit?: number
    search?: string
    featured?: boolean
    parentId?: string
    sortBy?: string
    sortOrder?: "ASC" | "DESC"
  }) {
    const { page = 1, limit = 10, search, featured, parentId, sortBy = "displayOrder", sortOrder = "ASC" } = options

    // Build query
    const queryBuilder = this.categoriesRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.parent", "parent")
      .leftJoinAndSelect("category.children", "children")

    // Apply filters
    if (search) {
      queryBuilder.andWhere("(category.name ILIKE :search OR category.description ILIKE :search)", {
        search: `%${search}%`,
      })
    }

    if (featured !== undefined) {
      queryBuilder.andWhere("category.featured = :featured", { featured })
    }

    if (parentId) {
      queryBuilder.andWhere("parent.id = :parentId", { parentId })
    } else {
      queryBuilder.andWhere("category.parent IS NULL")
    }

    // Apply sorting
    queryBuilder.orderBy(`category.${sortBy}`, sortOrder)

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit)

    // Execute query
    const [categories, total] = await queryBuilder.getManyAndCount()

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Find a category by ID
   * @param id Category ID
   * @returns Category
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ["parent", "children", "products"],
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }

  /**
   * Find a category by slug
   * @param slug Category slug
   * @returns Category
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
      relations: ["parent", "children", "products"],
    })

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`)
    }

    return category
  }

  /**
   * Find categories by IDs
   * @param ids Category IDs
   * @returns Categories
   */
  async findByIds(ids: string[]): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { id: In(ids) },
    })
  }

  /**
   * Update a category
   * @param id Category ID
   * @param updateCategoryDto Category update data
   * @returns Updated category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)
    const { parentId, ...categoryData } = updateCategoryDto

    // Update slug if name is changed
    if (categoryData.name && categoryData.name !== category.name) {
      categoryData.slug = slugify(categoryData.name)

      // Check if slug already exists
      const existingCategory = await this.categoriesRepository.findOne({
        where: { slug: categoryData.slug, id: Not(id) },
      })

      if (existingCategory) {
        categoryData.slug = `${categoryData.slug}-${Date.now()}`
      }
    }

    // Update parent category if provided
    if (parentId) {
      // Check for circular reference
      if (parentId === id) {
        throw new BadRequestException("Category cannot be its own parent")
      }

      const parentCategory = await this.findOne(parentId)
      category.parent = parentCategory
    } else if (parentId === null) {
      category.parent = null
    }

    // Update category
    const updatedCategory = Object.assign(category, categoryData)
    return this.categoriesRepository.save(updatedCategory)
  }

  /**
   * Remove a category
   * @param id Category ID
   * @returns Deletion result
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new BadRequestException("Cannot delete category with children")
    }

    await this.categoriesRepository.softRemove(category)
  }
}

