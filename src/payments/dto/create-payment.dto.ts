import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator"
import { PaymentMethod, PaymentStatus } from "@prisma/client"

export class CreatePaymentDto {
  @ApiProperty({ description: "Order ID associated with this payment" })
  @IsUUID()
  @IsNotEmpty()
  orderId: string

  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod

  @ApiProperty({ description: "Amount to be paid", example: 199.99 })
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty({ description: "Transaction reference from payment provider", required: false })
  @IsString()
  transactionReference?: string

  @ApiProperty({
    description: "Payment status",
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus = PaymentStatus.PENDING
}

