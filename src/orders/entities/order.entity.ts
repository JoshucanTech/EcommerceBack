import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"
import { OrderItem } from "./order-item.entity"
import { Address } from "../../addresses/entities/address.entity"
import { PaymentMethod } from "../../payment-methods/entities/payment-method.entity"
import { Delivery } from "../../deliveries/entities/delivery.entity"

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("orders")
export class Order extends BaseEntity {
  @ApiProperty({ description: "Order number (unique identifier for customers)" })
  @Column({ name: "order_number", unique: true })
  orderNumber: string

  @ApiProperty({ description: "Order subtotal (before tax and shipping)" })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number

  @ApiProperty({ description: "Order tax amount" })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  tax: number

  @ApiProperty({ description: "Order shipping cost" })
  @Column({ name: "shipping_cost", type: "decimal", precision: 10, scale: 2 })
  shippingCost: number

  @ApiProperty({ description: "Order discount amount" })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discount: number

  @ApiProperty({ description: "Order total amount (subtotal + tax + shipping - discount)" })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number

  @ApiProperty({ description: "Order status", enum: OrderStatus, default: OrderStatus.PENDING })
  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  @ApiProperty({ description: "Payment status", enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Column({
    name: "payment_status",
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus

  @ApiProperty({ description: "Payment method reference", required: false })
  @Column({ name: "payment_reference", nullable: true })
  paymentReference: string

  @ApiProperty({ description: "Order notes from customer", required: false })
  @Column({ type: "text", nullable: true })
  notes: string

  @ApiProperty({ description: "Coupon code applied to the order", required: false })
  @Column({ name: "coupon_code", nullable: true })
  couponCode: string

  @ApiProperty({ description: "Expected delivery date", required: false })
  @Column({ name: "expected_delivery_date", nullable: true })
  expectedDeliveryDate: Date

  // Relationships
  @ManyToOne(
    () => User,
    (user) => user.orders,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @OneToMany(
    () => OrderItem,
    (orderItem) => orderItem.order,
    { cascade: true },
  )
  items: OrderItem[]

  @ManyToOne(() => Address)
  @JoinColumn({ name: "shipping_address_id" })
  shippingAddress: Address

  @ManyToOne(() => Address)
  @JoinColumn({ name: "billing_address_id" })
  billingAddress: Address

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: "payment_method_id" })
  paymentMethod: PaymentMethod

  @OneToMany(
    () => Delivery,
    (delivery) => delivery.order,
  )
  deliveries: Delivery[]
}

