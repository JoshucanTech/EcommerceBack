import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator"
import { OrderStatus, PaymentStatus } from "../entities/order.entity"

export class UpdateOrderDto {
  @ApiProperty({ description: "Order status", enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus

  @ApiProperty({ description: "Payment status", enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus

  @ApiProperty({ description: "Payment reference", required: false })
  @IsString()
  @IsOptional()
  paymentReference?: string

  @ApiProperty({ description: "Expected delivery date", required: false })
  @IsOptional()
  expectedDeliveryDate?: Date

  @ApiProperty({ description: "Order notes", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ description: "Shipping address ID", required: false })
  @IsUUID()
  @IsOptional()
  shippingAddressId?: string

  @ApiProperty({ description: "Billing address ID", required: false })
  @IsUUID()
  @IsOptional()
  billingAddressId?: string
}

