import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateCouponDto } from "./dto/create-coupon.dto"
import type { UpdateCouponDto } from "./dto/update-coupon.dto"
import type { Coupon, CouponType } from "@prisma/client"

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new coupon
   * @param vendorId Vendor ID
   * @param createCouponDto Coupon creation data
   * @returns The created coupon
   */
  async create(vendorId: string, createCouponDto: CreateCouponDto): Promise<Coupon> {
    const { code, type, value, minOrderValue, maxDiscount, startDate, endDate, isActive, usageLimit } = createCouponDto

    // Validate coupon code
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code },
    })

    if (existingCoupon) {
      throw new BadRequestException("Coupon code already exists")
    }

    // Create coupon
    return this.prisma.coupon.create({
      data: {
        vendorId,
        code,
        type,
        value,
        minOrderValue,
        maxDiscount,
        startDate,
        endDate,
        isActive,
        usageLimit,
      },
    })
  }

  /**
   * Find all coupons with optional filtering
   * @param options Query options
   * @returns Array of coupons
   */
  async findAll(options?: {
    vendorId?: string
    type?: CouponType
    isActive?: boolean
    search?: string
    skip?: number
    take?: number
  }): Promise<Coupon[]> {
    const { vendorId, type, isActive, search, skip, take } = options || {}

    return this.prisma.coupon.findMany({
      where: {
        ...(vendorId && { vendorId }),
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          code: { contains: search, mode: "insensitive" },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    })
  }

  /**
   * Find a coupon by ID
   * @param id Coupon ID
   * @returns The found coupon or null
   */
  async findOne(id: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { id },
    })
  }

  /**
   * Find a coupon by code
   * @param code Coupon code
   * @returns The found coupon or null
   */
  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({
      where: { code },
    })
  }

  /**
   * Update a coupon
   * @param id Coupon ID
   * @param updateCouponDto Coupon update data
   * @returns The updated coupon
   */
  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id)
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`)
    }

    return this.prisma.coupon.update({
      where: { id },
      data: updateCouponDto,
    })
  }

  /**
   * Delete a coupon
   * @param id Coupon ID
   */
  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id)
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`)
    }

    await this.prisma.coupon.delete({
      where: { id },
    })
  }
}

