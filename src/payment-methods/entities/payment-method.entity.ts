import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BaseEntity } from "../../common/entities/base.entity"
import { User } from "../../users/entities/user.entity"

export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
  CRYPTO = "crypto",
  WALLET = "wallet",
}

@Entity("payment_methods")
export class PaymentMethod extends BaseEntity {
  @ApiProperty({ description: "Payment method type", enum: PaymentMethodType })
  @Column({
    type: "enum",
    enum: PaymentMethodType,
  })
  type: PaymentMethodType

  @ApiProperty({ description: "Payment method name (e.g., Visa ending in 1234)" })
  @Column()
  name: string

  @ApiProperty({ description: "Payment method details (masked)", required: false })
  @Column({ nullable: true })
  details: string

  @ApiProperty({ description: "Payment provider token or ID", required: false })
  @Column({ nullable: true })
  token: string

  @ApiProperty({ description: "Whether this is the default payment method", default: false })
  @Column({ default: false })
  isDefault: boolean

  @ApiProperty({ description: "Payment method expiry date", required: false })
  @Column({ name: "expiry_date", nullable: true })
  expiryDate: Date

  @ApiProperty({ description: "Billing address details", required: false })
  @Column({ type: "json", nullable: true })
  billingDetails: Record<string, any>

  // Relationships
  @ManyToOne(
    () => User,
    (user) => user.paymentMethods,
  )
  @JoinColumn({ name: "user_id" })
  user: User
}

