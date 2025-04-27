import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator"
import { Type } from "class-transformer"

export class DeliveryItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string

  @IsNotEmpty()
  @IsNumber()
  quantity: number
}

export class CreateDeliveryDto {
  @IsNotEmpty()
  @IsString()
  customerId: string

  @IsNotEmpty()
  @IsDateString()
  deliveryDate: string

  @IsOptional()
  @IsString()
  deliveryAddress?: string

  @IsOptional()
  @IsString()
  deliveryCity?: string

  @IsOptional()
  @IsString()
  deliveryState?: string

  @IsOptional()
  @IsString()
  deliveryZip?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  items: DeliveryItemDto[]
}

