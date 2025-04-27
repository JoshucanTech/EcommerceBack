import { IsEnum, IsOptional, IsString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { OrderStatus, PaymentStatus } from "@prisma/client"

export class UpdateOrderDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus

  @ApiPropertyOptional({ example: "Payment received via bank transfer" })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiPropertyOptional({ example: "pi_123456789" })
  @IsString()
  @IsOptional()
  paymentIntentId?: string
}

