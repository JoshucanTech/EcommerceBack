// Since the existing code was omitted for brevity and the updates indicate undeclared variables,
// I will assume the file contains validation logic using a library like 'class-validator' and 'class-transformer'.
// I will add the necessary imports to resolve the undeclared variables.

import { IsString, IsNumber, IsOptional, IsNotEmpty, Min } from "class-validator"
import { Type } from "class-transformer"

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  readonly paymentMethod: string

  @IsNumber()
  @Min(0.01)
  readonly amount: number

  @IsString()
  @IsOptional()
  readonly currency?: string

  @IsString()
  @IsOptional()
  readonly description?: string

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly orderId?: number
}

