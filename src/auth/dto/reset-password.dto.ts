import { IsString, IsNotEmpty, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ResetPasswordDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty({ example: "newPassword123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string
}

