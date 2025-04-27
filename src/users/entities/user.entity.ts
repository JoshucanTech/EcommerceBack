import { Entity, Column, OneToMany } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude } from "class-transformer"
import { BaseEntity } from "../../common/entities/base.entity"
import { Product } from "../../products/entities/product.entity"
import { Order } from "../../orders/entities/order.entity"
import { Review } from "../../reviews/entities/review.entity"
import { Address } from "../../addresses/entities/address.entity"
import { PaymentMethod } from "../../payment-methods/entities/payment-method.entity"
import { Wishlist } from "../../wishlist/entities/wishlist.entity"

export enum UserRole {
  BUYER = "buyer",
  VENDOR = "vendor",
  ADMIN = "admin",
  RIDER = "rider",
}

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty({ description: "User email address" })
  @Column({ unique: true })
  email: string

  @ApiProperty({ description: "User username" })
  @Column({ unique: true })
  username: string

  @ApiProperty({ description: "User first name" })
  @Column({ name: "first_name" })
  firstName: string

  @ApiProperty({ description: "User last name" })
  @Column({ name: "last_name" })
  lastName: string

  @Exclude()
  @Column()
  password: string

  @ApiProperty({ description: "User phone number", required: false })
  @Column({ nullable: true })
  phone: string

  @ApiProperty({ description: "User profile image URL", required: false })
  @Column({ name: "profile_image", nullable: true })
  profileImage: string

  @ApiProperty({ description: "User role", enum: UserRole, default: UserRole.BUYER })
  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.BUYER,
  })
  role: UserRole

  @ApiProperty({ description: "Whether the user is active", default: true })
  @Column({ default: true })
  isActive: boolean

  @ApiProperty({ description: "Whether the user email is verified", default: false })
  @Column({ name: "is_email_verified", default: false })
  isEmailVerified: boolean

  @ApiProperty({ description: "User last login date", required: false })
  @Column({ name: "last_login", nullable: true })
  lastLogin: Date

  @ApiProperty({ description: "User bio", required: false })
  @Column({ type: "text", nullable: true })
  bio: string

  // Relationships
  @OneToMany(
    () => Product,
    (product) => product.vendor,
  )
  products: Product[]

  @OneToMany(
    () => Order,
    (order) => order.user,
  )
  orders: Order[]

  @OneToMany(
    () => Review,
    (review) => review.user,
  )
  reviews: Review[]

  @OneToMany(
    () => Address,
    (address) => address.user,
  )
  addresses: Address[]

  @OneToMany(
    () => PaymentMethod,
    (paymentMethod) => paymentMethod.user,
  )
  paymentMethods: PaymentMethod[]

  @OneToMany(
    () => Wishlist,
    (wishlist) => wishlist.user,
  )
  wishlistItems: Wishlist[]
}

