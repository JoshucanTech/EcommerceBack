import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, IsUUID, IsObject } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateProductDto {
  @ApiProperty({ example: "Product Name" })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: "product-name" })
  @IsString()
  @IsOptional()
  slug?: string

  @ApiPropertyOptional({ example: "Product description" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number

  @ApiPropertyOptional({ example: 129.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  compareAtPrice?: number

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number

  @ApiPropertyOptional({ example: "SKU123" })
  @IsString()
  @IsOptional()
  sku?: string

  @ApiPropertyOptional({ example: "123456789" })
  @IsString()
  @IsOptional()
  barcode?: string

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  inventory?: number

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number

  @ApiPropertyOptional({ example: "10x5x2" })
  @IsString()
  @IsOptional()
  dimensions?: string

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  vendorId?: string

  @ApiPropertyOptional({ type: [String], example: ["https://example.com/image1.jpg"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]

  @ApiPropertyOptional({ type: [String], example: ["tag1", "tag2"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]

  @ApiPropertyOptional({ example: { color: "red", size: "large" } })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>
}

