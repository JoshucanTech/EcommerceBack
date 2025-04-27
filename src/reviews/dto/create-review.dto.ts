import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator"

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  comment: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number

  @IsOptional()
  @IsNumber()
  productId: number

  @IsOptional()
  @IsNumber()
  userId: number
}

