import { IsString, IsOptional, IsBoolean, IsUUID } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateCategoryDto {
  @ApiProperty({ example: "Category Name" })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: "category-name" })
  @IsString()
  @IsOptional()
  slug?: string

  @ApiPropertyOptional({ example: "Category description" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  @IsOptional()
  parentId?: string

  @ApiPropertyOptional({ example: "https://example.com/image.jpg" })
  @IsString()
  @IsOptional()
  image?: string

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

