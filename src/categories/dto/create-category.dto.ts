import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from "class-validator"

export class CreateCategoryDto {
  @ApiProperty({ description: "Category name" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: "Category description", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "Category slug for SEO-friendly URLs", required: false })
  @IsString()
  @IsOptional()
  slug?: string

  @ApiProperty({ description: "Category image URL", required: false })
  @IsString()
  @IsOptional()
  image?: string

  @ApiProperty({ description: "Category icon", required: false })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiProperty({ description: "Whether the category is featured", default: false })
  @IsBoolean()
  @IsOptional()
  featured?: boolean

  @ApiProperty({ description: "Category display order", default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number

  @ApiProperty({ description: "Category meta title for SEO", required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string

  @ApiProperty({ description: "Category meta description for SEO", required: false })
  @IsString()
  @IsOptional()
  metaDescription?: string

  @ApiProperty({ description: "Parent category ID", required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string
}

