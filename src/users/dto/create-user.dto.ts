import { IsEmail, IsString, IsOptional, MinLength, IsBoolean, IsEnum } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Role } from "@prisma/client"

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "password123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiPropertyOptional({ example: "John" })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiPropertyOptional({ example: "Doe" })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiPropertyOptional({ example: "+1234567890" })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiPropertyOptional({ example: "https://example.com/avatar.jpg" })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiPropertyOptional({ enum: Role, default: Role.BUYER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  verificationToken?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resetToken?: string

  @ApiPropertyOptional()
  @IsOptional()
  resetTokenExpiry?: Date
}

