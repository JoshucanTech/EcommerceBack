import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("reviews")
export class Review extends BaseEntity {
  @ApiProperty({ description: "Review rating (1-5)" })
  @Column({ type: "decimal", precision: 2, scale: 1 })
  rating: number

  @ApiProperty({ description: "Review title", required: false })
  @Column({ nullable: true })
  title: string

  @ApiProperty({ description: "Review content" })
  @Column({ type: "text" })
  content: string

  @ApiProperty({ description: "Whether the review is verified (user purchased the product)", default: false })
  @Column({ default: false })
  verified: boolean

  @ApiProperty({ description: "Review images URLs", required: false })
  @Column({ type: "json", nullable: true })
  images: string[]

  @ApiProperty({ description: "Whether the review is approved by admin", default: true })
  @Column({ default: true })
  approved: boolean

  @ApiProperty({ description: "Helpful votes count", default: 0 })
  @Column({ name: "helpful_votes", default: 0 })
  helpfulVotes: number

  @ApiProperty({ description: "Not helpful votes count", default: 0 })
  @Column({ name: "not_helpful_votes", default: 0 })
  notHelpfulVotes: number

  // Relationships
  @ManyToOne(
    () => User,
    (user) => user.reviews,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToOne(
    () => Product,
    (product) => product.reviews,
  )
  @JoinColumn({ name: "product_id" })
  product: Product
}

