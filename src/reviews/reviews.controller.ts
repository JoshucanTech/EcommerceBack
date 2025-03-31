import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

import type { ReviewsService } from "./reviews.service"
import type { CreateReviewDto } from "./dto/create-review.dto"
import type { UpdateReviewDto } from "./dto/update-review.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("reviews")
@Controller("reviews")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new review" })
  @ApiResponse({ status: 201, description: "Review created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    return this.reviewsService.create(req.user.id, createReviewDto)
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findAll(@Param('productId') productId: string) {
    return this.reviewsService.findAll(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update review" })
  @ApiResponse({ status: 200, description: "Review updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Review not found" })
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(id);
  }
}

