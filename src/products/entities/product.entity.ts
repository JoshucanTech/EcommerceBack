import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"
import { Category } from "../../categories/entities/category.entity"
import { Review } from "../../reviews/entities/review.entity"
import { OrderItem } from "../../orders/entities/order-item.entity"
import { Wishlist } from "../../wishlist/entities/wishlist.entity"
import { InventoryItem } from "../../inventory/entities/inventory-item.entity"

@Entity("products")
export class Product extends BaseEntity {
  @ApiProperty({ description: "Product name" })
  @Column()
  name: string

  @ApiProperty({ description: "Product description" })
  @Column({ type: "text" })
  description: string

  @ApiProperty({ description: "Product price" })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number

  @ApiProperty({ description: "Product discount price", required: false })
  @Column({ name: "discount_price", type: "decimal", precision: 10, scale: 2, nullable: true })
  discountPrice: number

  @ApiProperty({ description: "Product main image URL" })
  @Column({ name: "main_image" })
  mainImage: string

  @ApiProperty({ description: "Product additional images URLs", required: false })
  @Column({ name: "additional_images", type: "json", nullable: true })
  additionalImages: string[]

  @ApiProperty({ description: "Product SKU (Stock Keeping Unit)", required: false })
  @Column({ nullable: true })
  sku: string

  @ApiProperty({ description: "Product quantity in stock" })
  @Column({ default: 0 })
  quantity: number

  @ApiProperty({ description: "Whether the product is featured", default: false })
  @Column({ default: false })
  featured: boolean

  @ApiProperty({ description: "Whether the product is on sale", default: false })
  @Column({ name: "on_sale", default: false })
  onSale: boolean

  @ApiProperty({ description: "Product average rating", default: 0 })
  @Column({ name: "average_rating", type: "decimal", precision: 3, scale: 2, default: 0 })
  averageRating: number

  @ApiProperty({ description: "Product total reviews", default: 0 })
  @Column({ name: "total_reviews", default: 0 })
  totalReviews: number

  @ApiProperty({ description: "Product specifications", required: false })
  @Column({ type: "json", nullable: true })
  specifications: Record<string, any>

  @ApiProperty({ description: "Product weight in kg", required: false })
  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  weight: number

  @ApiProperty({ description: "Product dimensions (L x W x H) in cm", required: false })
  @Column({ type: "json", nullable: true })
  dimensions: { length: number; width: number; height: number }

  @ApiProperty({ description: "Product slug for SEO-friendly URLs" })
  @Column({ unique: true })
  slug: string

  @ApiProperty({ description: "Product meta title for SEO", required: false })
  @Column({ name: "meta_title", nullable: true })
  metaTitle: string

  @ApiProperty({ description: "Product meta description for SEO", required: false })
  @Column({ name: "meta_description", type: "text", nullable: true })
  metaDescription: string

  // Relationships
  @ManyToOne(
    () => User,
    (user) => user.products,
  )
  @JoinColumn({ name: "vendor_id" })
  vendor: User

  @ManyToMany(
    () => Category,
    (category) => category.products,
  )
  @JoinTable({
    name: "product_categories",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories: Category[]

  @OneToMany(
    () => Review,
    (review) => review.product,
  )
  reviews: Review[]

  @OneToMany(
    () => OrderItem,
    (orderItem) => orderItem.product,
  )
  orderItems: OrderItem[]

  @OneToMany(
    () => Wishlist,
    (wishlist) => wishlist.product,
  )
  wishlistItems: Wishlist[]

  @OneToMany(
    () => InventoryItem,
    (inventoryItem) => inventoryItem.product,
  )
  inventoryItems: InventoryItem[]
}

