import { IsArray, IsString, IsOptional, IsUUID, ValidateNested, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class OrderItemDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  productId: string

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  addressId: string

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  paymentMethodId?: string

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  couponId?: string

  @ApiPropertyOptional({ example: "Please deliver to the back door" })
  @IsString()
  @IsOptional()
  notes?: string
}

