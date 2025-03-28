import { Entity, Column, OneToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"

export enum VendorStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

@Entity("vendor_profiles")
export class VendorProfile extends BaseEntity {
  @ApiProperty({ description: "Store/Business name" })
  @Column({ name: "store_name" })
  storeName: string

  @ApiProperty({ description: "Store/Business description" })
  @Column({ name: "store_description", type: "text" })
  storeDescription: string

  @ApiProperty({ description: "Store logo URL", required: false })
  @Column({ name: "logo_url", nullable: true })
  logoUrl: string

  @ApiProperty({ description: "Store banner image URL", required: false })
  @Column({ name: "banner_url", nullable: true })
  bannerUrl: string

  @ApiProperty({ description: "Store contact email" })
  @Column({ name: "contact_email" })
  contactEmail: string

  @ApiProperty({ description: "Store contact phone" })
  @Column({ name: "contact_phone" })
  contactPhone: string

  @ApiProperty({ description: "Store address" })
  @Column({ type: "text" })
  address: string

  @ApiProperty({ description: "Store city" })
  @Column()
  city: string

  @ApiProperty({ description: "Store state/province" })
  @Column()
  state: string

  @ApiProperty({ description: "Store postal/ZIP code" })
  @Column({ name: "postal_code" })
  postalCode: string

  @ApiProperty({ description: "Store country" })
  @Column()
  country: string

  @ApiProperty({ description: "Store latitude", required: false })
  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude: number

  @ApiProperty({ description: "Store longitude", required: false })
  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  longitude: number

  @ApiProperty({ description: "Business registration number" })
  @Column({ name: "registration_number" })
  registrationNumber: string

  @ApiProperty({ description: "Tax ID/VAT number" })
  @Column({ name: "tax_id" })
  taxId: string

  @ApiProperty({ description: "Commission rate (percentage)", default: 10 })
  @Column({ name: "commission_rate", type: "decimal", precision: 5, scale: 2, default: 10 })
  commissionRate: number

  @ApiProperty({ description: "Vendor status", enum: VendorStatus, default: VendorStatus.PENDING })
  @Column({
    type: "enum",
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status: VendorStatus

  @ApiProperty({ description: "Vendor average rating", default: 0 })
  @Column({ name: "average_rating", type: "decimal", precision: 3, scale: 2, default: 0 })
  averageRating: number

  @ApiProperty({ description: "Vendor total reviews", default: 0 })
  @Column({ name: "total_reviews", default: 0 })
  totalReviews: number

  @ApiProperty({ description: "Vendor total sales", default: 0 })
  @Column({ name: "total_sales", default: 0 })
  totalSales: number

  @ApiProperty({ description: "Vendor total earnings", default: 0 })
  @Column({ name: "total_earnings", type: "decimal", precision: 10, scale: 2, default: 0 })
  totalEarnings: number

  @ApiProperty({ description: "Vendor documents (business registration, etc.)", required: false })
  @Column({ type: "json", nullable: true })
  documents: Record<string, string>

  @ApiProperty({ description: "Vendor bank account details", required: false })
  @Column({ name: "bank_details", type: "json", nullable: true })
  bankDetails: Record<string, any>

  @ApiProperty({ description: "Vendor social media links", required: false })
  @Column({ name: "social_media", type: "json", nullable: true })
  socialMedia: Record<string, string>

  @ApiProperty({ description: "Vendor operating hours", required: false })
  @Column({ name: "operating_hours", type: "json", nullable: true })
  operatingHours: Record<string, { open: string; close: string }>

  @ApiProperty({ description: "Vendor store policies", required: false })
  @Column({ name: "store_policies", type: "json", nullable: true })
  storePolicies: {
    returns?: string
    shipping?: string
    privacy?: string
    terms?: string
  }

  @ApiProperty({ description: "Vendor SEO metadata", required: false })
  @Column({ name: "seo_metadata", type: "json", nullable: true })
  seoMetadata: {
    title?: string
    description?: string
    keywords?: string[]
  }

  @ApiProperty({ description: "Vendor slug for SEO-friendly URLs" })
  @Column({ unique: true })
  slug: string

  // Relationships
  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User
}

