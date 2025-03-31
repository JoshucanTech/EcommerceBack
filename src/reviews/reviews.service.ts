import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { ProductsService } from "../products/products.service"
import type { CreateReviewDto } from "./dto/create-review.dto"
import type { UpdateReviewDto } from "./dto/update-review.dto"
import type { Review } from "@prisma/client"

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  /**
   * Create a new review
   * @param userId User ID
   * @param createReviewDto Review creation data
   * @returns The created review
   */
  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const { productId, rating, comment, images } = createReviewDto

    // Validate product
    const product = await this.productsService.findById(productId)
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId },
    })

    if (existingReview) {
      throw new BadRequestException("User already reviewed this product")
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        images,
      },
    })

    // Update product rating
    await this.updateProductRating(productId)

    return review
  }

  /**
   * Find all reviews for a product
   * @param productId Product ID
   * @returns Array of reviews
   */
  async findAll(productId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  /**
   * Find a review by ID
   * @param id Review ID
   * @returns The found review or null
   */
  async findOne(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        product: true,
      },
    })
  }

  /**
   * Update a review
   * @param id Review ID
   * @param updateReviewDto Review update data
   * @returns The updated review
   */
  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const { rating, comment, images } = updateReviewDto

    const review = await this.findOne(id)
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`)
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        rating,
        comment,
        images,
      },
    })

    // Update product rating
    await this.updateProductRating(review.productId)

    return updatedReview
  }

  /**
   * Delete a review
   * @param id Review ID
   */
  async remove(id: string): Promise<void> {
    const review = await this.findOne(id)
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`)
    }

    await this.prisma.review.delete({
      where: { id },
    })

    // Update product rating
    await this.updateProductRating(review.productId)
  }

  /**
   * Update product rating based on reviews
   * @param productId Product ID
   */
  private async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.findAll(productId)

    if (reviews.length === 0) {
      await this.productsService.update(productId, {
        rating: 0,
        totalRatings: 0,
      })
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await this.productsService.update(productId, {
      rating: averageRating,
      totalRatings: reviews.length,
    })
  }
}

