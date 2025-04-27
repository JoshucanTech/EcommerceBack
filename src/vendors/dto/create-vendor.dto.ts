import { IsString, IsOptional, IsNumber, Min, IsArray } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateVendorDto {
  @ApiProperty({ example: "Business Name" })
  @IsString()
  businessName: string

  @ApiPropertyOptional({ example: "business@example.com" })
  @IsString()
  @IsOptional()
  businessEmail?: string

  @ApiPropertyOptional({ example: "+1234567890" })
  @IsString()
  @IsOptional()
  businessPhone?: string

  @ApiPropertyOptional({ example: "123 Business St, City, State, Country" })
  @IsString()
  @IsOptional()
  businessAddress?: string

  @ApiPropertyOptional({ example: "https://example.com/logo.jpg" })
  @IsString()
  @IsOptional()
  businessLogo?: string

  @ApiPropertyOptional({ example: "https://example.com/banner.jpg" })
  @IsString()
  @IsOptional()
  businessBanner?: string

  @ApiPropertyOptional({ example: "We sell high-quality products..." })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ type: [String], example: ["https://example.com/doc1.pdf"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  verificationDocuments?: string[]

  @ApiPropertyOptional({ example: 5.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number

  @ApiPropertyOptional({ example: "Bank Name" })
  @IsString()
  @IsOptional()
  bankName?: string

  @ApiPropertyOptional({ example: "1234567890" })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string

  @ApiPropertyOptional({ example: "Account Name" })
  @IsString()
  @IsOptional()
  bankAccountName?: string
}

