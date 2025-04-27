import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from "class-validator"
import { UserRole } from "../entities/user.entity"

export class CreateUserDto {
  @ApiProperty({ description: "User email address" })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: "User username" })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ description: "User first name" })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({ description: "User last name" })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({ description: "User password" })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string

  @ApiProperty({ description: "User phone number", required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ description: "User role", enum: UserRole, default: UserRole.BUYER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.BUYER

  @ApiProperty({ description: "User bio", required: false })
  @IsString()
  @IsOptional()
  bio?: string
}

