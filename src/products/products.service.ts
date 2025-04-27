import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, In, Not } from "typeorm"
import { Product } from "./entities/product.entity"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import type { CategoriesService } from "../categories/categories.service"
import type { User } from "../users/entities/user.entity"
import { slugify } from "../common/utils/slugify.util"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private categoriesService: CategoriesService,
  ) {}

  /**
   * Create a new product
   * @param createProductDto Product creation data
   * @param vendor Vendor user
   * @returns Created product
   */
  async create(createProductDto: CreateProductDto, vendor: User): Promise<Product> {
    const { categoryIds, ...productData } = createProductDto

    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = slugify(productData.name)
    }

    // Check if slug already exists
    const existingProduct = await this.productsRepository.findOne({
      where: { slug: productData.slug },
    })

    if (existingProduct) {
      productData.slug = `${productData.slug}-${Date.now()}`
    }

    // Create product
    const product = this.productsRepository.create({
      ...productData,
      vendor,
    })

    // Add categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoriesService.findByIds(categoryIds)
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException("One or more categories not found")
      }
      product.categories = categories
    }

    return this.productsRepository.save(product)
  }

  /**
   * Find all products with filtering and pagination
   * @param options Filter and pagination options
   * @returns Paginated products
   */
  async findAll(options: {
    page?: number
    limit?: number
    search?: string
    category?: string
    vendor?: string
    minPrice?: number
    maxPrice?: number
    featured?: boolean
    onSale?: boolean
    sortBy?: string
    sortOrder?: "ASC" | "DESC"
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      vendor,
      minPrice,
      maxPrice,
      featured,
      onSale,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = options

    // Build query
    const queryBuilder = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.vendor", "vendor")
      .leftJoinAndSelect("product.categories", "category")

    // Apply filters
    if (search) {
      queryBuilder.andWhere("(product.name ILIKE :search OR product.description ILIKE :search)", {
        search: `%${search}%`,
      })
    }

    if (category) {
      queryBuilder.andWhere("category.slug = :category", { category })
    }

    if (vendor) {
      queryBuilder.andWhere("vendor.id = :vendor", { vendor })
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice })
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice })
    }

    if (featured !== undefined) {
      queryBuilder.andWhere("product.featured = :featured", { featured })
    }

    if (onSale !== undefined) {
      queryBuilder.andWhere("product.onSale = :onSale", { onSale })
    }

    // Apply sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder)

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit)

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount()

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Find a product by ID
   * @param id Product ID
   * @returns Product
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ["vendor", "categories", "reviews"],
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  /**
   * Find a product by slug
   * @param slug Product slug
   * @returns Product
   */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ["vendor", "categories", "reviews"],
    })

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`)
    }

    return product
  }

  /**
   * Find products by IDs
   * @param ids Product IDs
   * @returns Products
   */
  async findByIds(ids: string[]): Promise<Product[]> {
    return this.productsRepository.find({
      where: { id: In(ids) },
    })
  }

  /**
   * Update a product
   * @param id Product ID
   * @param updateProductDto Product update data
   * @param vendor Vendor user
   * @returns Updated product
   */
  async update(id: string, updateProductDto: UpdateProductDto, vendor: User): Promise<Product> {
    const product = await this.findOne(id)

    // Check if user is the vendor of the product
    if (product.vendor.id !== vendor.id) {
      throw new BadRequestException("You can only update your own products")
    }

    const { categoryIds, ...productData } = updateProductDto

    // Update slug if name is changed
    if (productData.name && productData.name !== product.name) {
      productData.slug = slugify(productData.name)

      // Check if slug already exists
      const existingProduct = await this.productsRepository.findOne({
        where: { slug: productData.slug, id: Not(id) },
      })

      if (existingProduct) {
        productData.slug = `${productData.slug}-${Date.now()}`
      }
    }

    // Update categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoriesService.findByIds(categoryIds)
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException("One or more categories not found")
      }
      product.categories = categories
    }

    // Update product
    const updatedProduct = Object.assign(product, productData)
    return this.productsRepository.save(updatedProduct)
  }

  /**
   * Remove a product
   * @param id Product ID
   * @param vendor Vendor user
   * @returns Deletion result
   */
  async remove(id: string, vendor: User): Promise<void> {
    const product = await this.findOne(id)

    // Check if user is the vendor of the product
    if (product.vendor.id !== vendor.id) {
      throw new BadRequestException("You can only delete your own products")
    }

    await this.productsRepository.softRemove(product)
  }

  /**
   * Update product rating
   * @param id Product ID
   * @param rating New rating
   * @param isNewReview Whether this is a new review
   * @returns Updated product
   */
  async updateRating(id: string, rating: number, isNewReview: boolean): Promise<Product> {
    const product = await this.findOne(id)

    // Calculate new average rating
    const totalReviews = isNewReview ? product.totalReviews + 1 : product.totalReviews
    const currentRatingTotal = product.averageRating * product.totalReviews
    const newRatingTotal = isNewReview
      ? currentRatingTotal + rating
      : currentRatingTotal + rating - product.averageRating
    const newAverageRating = newRatingTotal / totalReviews

    // Update product
    product.averageRating = newAverageRating
    product.totalReviews = totalReviews

    return this.productsRepository.save(product)
  }
}

