import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { Stripe } from "stripe"

import type { PaymentsService } from "./payments.service"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import type { UpdatePaymentDto } from "./dto/update-payment.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("methods")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new payment method" })
  @ApiResponse({ status: 201, description: "Payment method created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createPaymentMethod(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentsService.createPaymentMethod(req.user.id, createPaymentDto)
  }

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment methods for a user' })
  @ApiResponse({ status: 200, description: 'List of payment methods' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllPaymentMethods(@Req() req) {
    return this.paymentsService.findAllPaymentMethods(req.user.id);
  }

  @Get('methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiResponse({ status: 200, description: 'Payment method details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findPaymentMethodById(@Param('id') id: string) {
    return this.paymentsService.findPaymentMethodById(id);
  }

  @Patch("methods/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update payment method" })
  @ApiResponse({ status: 200, description: "Payment method updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Payment method not found" })
  async updatePaymentMethod(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req) {
    return this.paymentsService.updatePaymentMethod(id, updatePaymentDto)
  }

  @Delete('methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 204, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async removePaymentMethod(@Param('id') id: string) {
    await this.paymentsService.removePaymentMethod(id);
  }

  @Post('intents/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPaymentIntent(@Param('orderId') orderId: string) {
    return this.paymentsService.createPaymentIntent(orderId);
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Stripe webhook endpoint" })
  @ApiResponse({ status: 200, description: "Webhook received" })
  async stripeWebhook(@Body() payload: any, @Headers('stripe-signature') signature: string): Promise<void> {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      })

      const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)

      await this.paymentsService.handleStripeWebhook(event)
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message)
      throw new Error(`Webhook signature verification failed.`)
    }
  }
}

