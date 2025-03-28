import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { Order } from "../../orders/entities/order.entity"
import { User } from "../../users/entities/user.entity"

export enum DeliveryStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  FAILED = "failed",
  RETURNED = "returned",
}

@Entity("deliveries")
export class Delivery extends BaseEntity {
  @ApiProperty({ description: "Delivery tracking number" })
  @Column({ name: "tracking_number", unique: true })
  trackingNumber: string

  @ApiProperty({ description: "Delivery status", enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  @Column({
    type: "enum",
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus

  @ApiProperty({ description: "Estimated delivery date", required: false })
  @Column({ name: "estimated_delivery_date", nullable: true })
  estimatedDeliveryDate: Date

  @ApiProperty({ description: "Actual delivery date", required: false })
  @Column({ name: "actual_delivery_date", nullable: true })
  actualDeliveryDate: Date

  @ApiProperty({ description: "Delivery notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string

  @ApiProperty({ description: "Signature image URL", required: false })
  @Column({ name: "signature_image", nullable: true })
  signatureImage: string

  @ApiProperty({ description: "Proof of delivery image URL", required: false })
  @Column({ name: "proof_of_delivery", nullable: true })
  proofOfDelivery: string

  @ApiProperty({ description: "Current location details", required: false })
  @Column({ type: "json", nullable: true })
  currentLocation: {
    latitude: number
    longitude: number
    address: string
    timestamp: Date
  }

  @ApiProperty({ description: "Delivery history", required: false })
  @Column({ type: "json", nullable: true })
  history: Array<{
    status: DeliveryStatus
    timestamp: Date
    location?: {
      latitude: number
      longitude: number
      address: string
    }
    notes?: string
  }>

  // Relationships
  @ManyToOne(
    () => Order,
    (order) => order.deliveries,
  )
  @JoinColumn({ name: "order_id" })
  order: Order

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "rider_id" })
  rider: User
}

