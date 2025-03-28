import { Entity, ManyToOne, JoinColumn, Unique } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("wishlist")
@Unique(["user", "product"])
export class Wishlist extends BaseEntity {
  // Relationships
  @ApiProperty({ description: "User who added the product to wishlist" })
  @ManyToOne(
    () => User,
    (user) => user.wishlistItems,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @ApiProperty({ description: "Product added to wishlist" })
  @ManyToOne(
    () => Product,
    (product) => product.wishlistItems,
  )
  @JoinColumn({ name: "product_id" })
  product: Product
}

