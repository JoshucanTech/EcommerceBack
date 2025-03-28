import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
  FREE_SHIPPING = "free_shipping",
}

@Entity("coupons")
export class Coupon extends BaseEntity {
  @ApiProperty({ description: "Coupon code" })
  @Column({ unique: true })
  code: string

  @ApiProperty({ description: "Coupon description", required: false })
  @Column({ type: "text", nullable: true })
  description: string

  @ApiProperty({ description: "Discount type", enum: DiscountType })
  @Column({
    name: "discount_type",
    type: "enum",
    enum: DiscountType,
  })
  discountType: DiscountType

  @ApiProperty({ description: "Discount value (percentage or fixed amount)" })
  @Column({ name: "discount_value", type: "decimal", precision: 10, scale: 2 })
  discountValue: number

  @ApiProperty({ description: "Minimum order amount to apply coupon", required: false })
  @Column({ name: "minimum_order_amount", type: "decimal", precision: 10, scale: 2, nullable: true })
  minimumOrderAmount: number

  @ApiProperty({ description: "Maximum discount amount (for percentage discounts)", required: false })
  @Column({ name: "maximum_discount_amount", type: "decimal", precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount: number

  @ApiProperty({ description: "Start date of coupon validity" })
  @Column({ name: "start_date" })
  startDate: Date

  @ApiProperty({ description: "End date of coupon validity" })
  @Column({ name: "end_date" })
  endDate: Date

  @ApiProperty({ description: "Whether the coupon is active", default: true })
  @Column({ default: true })
  active: boolean

  @ApiProperty({ description: "Usage limit per user (0 for unlimited)", default: 1 })
  @Column({ name: "usage_limit_per_user", default: 1 })
  usageLimitPerUser: number

  @ApiProperty({ description: "Total usage limit (0 for unlimited)", default: 0 })
  @Column({ name: "total_usage_limit", default: 0 })
  totalUsageLimit: number

  @ApiProperty({ description: "Current usage count", default: 0 })
  @Column({ name: "usage_count", default: 0 })
  usageCount: number

  @ApiProperty({ description: "Whether the coupon is for first-time customers only", default: false })
  @Column({ name: "first_time_customers_only", default: false })
  firstTimeCustomersOnly: boolean

  @ApiProperty({ description: "Applicable product IDs (empty for all products)", required: false })
  @Column({ name: "product_ids", type: "json", nullable: true })
  productIds: string[]

  @ApiProperty({ description: "Applicable category IDs (empty for all categories)", required: false })
  @Column({ name: "category_ids", type: "json", nullable: true })
  categoryIds: string[]

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "vendor_id" })
  vendor: User
}

