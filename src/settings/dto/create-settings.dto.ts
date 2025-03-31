import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateSettingsDto {
  @IsString()
  @IsNotEmpty()
  key: string

  @IsString()
  @IsNotEmpty()
  value: string

  @IsString()
  @IsOptional()
  description?: string

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean
}

