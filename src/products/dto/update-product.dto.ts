import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsObject, Min, IsUUID } from "class-validator"

export class UpdateProductDto {
  @ApiProperty({ description: "Product name", required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: "Product description", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "Product price", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number

  @ApiProperty({ description: "Product discount price", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number

  @ApiProperty({ description: "Product main image URL", required: false })
  @IsString()
  @IsOptional()
  mainImage?: string

  @ApiProperty({ description: "Product additional images URLs", required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalImages?: string[]

  @ApiProperty({ description: "Product SKU (Stock Keeping Unit)", required: false })
  @IsString()
  @IsOptional()
  sku?: string

  @ApiProperty({ description: "Product quantity in stock", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number

  @ApiProperty({ description: "Whether the product is featured", required: false })
  @IsBoolean()
  @IsOptional()
  featured?: boolean

  @ApiProperty({ description: "Whether the product is on sale", required: false })
  @IsBoolean()
  @IsOptional()
  onSale?: boolean

  @ApiProperty({ description: "Product specifications", required: false })
  @IsObject()
  @IsOptional()
  specifications?: Record<string, any>

  @ApiProperty({ description: "Product weight in kg", required: false })
  @IsNumber()
  @IsOptional()
  weight?: number

  @ApiProperty({ description: "Product dimensions (L x W x H) in cm", required: false })
  @IsObject()
  @IsOptional()
  dimensions?: { length: number; width: number; height: number }

  @ApiProperty({ description: "Product slug for SEO-friendly URLs", required: false })
  @IsString()
  @IsOptional()
  slug?: string

  @ApiProperty({ description: "Product meta title for SEO", required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string

  @ApiProperty({ description: "Product meta description for SEO", required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string

  @ApiProperty({ description: "Category IDs", type: [String], required: false })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  categoryIds?: string[]
}

