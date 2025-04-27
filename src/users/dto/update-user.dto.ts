import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from "class-validator"
import { UserRole } from "../entities/user.entity"

export class UpdateUserDto {
  @ApiProperty({ description: "User email address", required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ description: "User username", required: false })
  @IsString()
  @IsOptional()
  username?: string

  @ApiProperty({ description: "User first name", required: false })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({ description: "User last name", required: false })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({ description: "User password", required: false })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string

  @ApiProperty({ description: "User phone number", required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: "User profile image URL", required: false })
  @IsString()
  @IsOptional()
  profileImage?: string

  @ApiProperty({ description: "User role", enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiProperty({ description: "Whether the user is active", required: false })
  @IsOptional()
  isActive?: boolean

  @ApiProperty({ description: "User bio", required: false })
  @IsString()
  @IsOptional()
  bio?: string
}

