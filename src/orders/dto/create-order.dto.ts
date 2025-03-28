import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsArray, IsUUID, IsNumber, Min, IsOptional, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

class OrderItemDto {
  @ApiProperty({ description: "Product ID" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ description: "Quantity of the product" })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number

  @ApiProperty({ description: "Selected product options (color, size, etc.)", required: false })
  @IsOptional()
  options?: Record<string, any>
}

export class CreateOrderDto {
  @ApiProperty({ description: "Order items", type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[]

  @ApiProperty({ description: "Shipping address ID" })
  @IsUUID()
  @IsNotEmpty()
  shippingAddressId: string

  @ApiProperty({ description: "Billing address ID (if different from shipping)", required: false })
  @IsUUID()
  @IsOptional()
  billingAddressId?: string

  @ApiProperty({ description: "Payment method ID" })
  @IsUUID()
  @IsNotEmpty()
  paymentMethodId: string

  @ApiProperty({ description: "Coupon code", required: false })
  @IsString()
  @IsOptional()
  couponCode?: string

  @ApiProperty({ description: "Order notes from customer", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}

