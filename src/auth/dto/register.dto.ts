import { IsEmail, IsString, IsOptional, MinLength, IsEnum } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Role } from "@prisma/client"

export class RegisterDto {
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

  @ApiPropertyOptional({ enum: Role, default: Role.BUYER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

