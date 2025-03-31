import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import Stripe from "stripe"

import type { PrismaService } from "../prisma/prisma.service"
import type { UsersService } from "../users/users.service"
import type { OrdersService } from "../orders/orders.service"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import type { UpdatePaymentDto } from "./dto/update-payment.dto"
import { type PaymentMethod, PaymentStatus } from "@prisma/client"

@Injectable()
export class PaymentsService {
  private stripe: Stripe

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>("STRIPE_SECRET_KEY"), {
      apiVersion: "2023-10-16",
    })
  }

  /**
   * Create a new payment method
   * @param userId User ID
   * @param createPaymentDto Payment method creation data
   * @returns The created payment method
   */
  async createPaymentMethod(userId: string, createPaymentDto: CreatePaymentDto): Promise<PaymentMethod> {
    const { type, provider, accountNumber, expiryMonth, expiryYear } = createPaymentDto

    // Validate user
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    // Create payment method
    return this.prisma.paymentMethod.create({
      data: {
        userId,
        type,
        provider,
        accountNumber,
        expiryMonth,
        expiryYear,
      },
    })
  }

  /**
   * Find all payment methods for a user
   * @param userId User ID
   * @returns Array of payment methods
   */
  async findAllPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
    })
  }

  /**
   * Find a payment method by ID
   * @param id Payment method ID
   * @returns The found payment method or null
   */
  async findPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    return this.prisma.paymentMethod.findUnique({
      where: { id },
    })
  }

  /**
   * Update a payment method
   * @param id Payment method ID
   * @param updatePaymentDto Payment method update data
   * @returns The updated payment method
   */
  async updatePaymentMethod(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentMethod> {
    const paymentMethod = await this.findPaymentMethodById(id)
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: updatePaymentDto,
    })
  }

  /**
   * Delete a payment method
   * @param id Payment method ID
   */
  async removePaymentMethod(id: string): Promise<void> {
    const paymentMethod = await this.findPaymentMethodById(id)
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    })
  }

  /**
   * Create a payment intent
   * @param orderId Order ID
   * @returns The created payment intent
   */
  async createPaymentIntent(orderId: string): Promise<Stripe.PaymentIntent> {
    const order = await this.ordersService.findById(orderId)
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`)
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException("Order payment status is not pending")
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe uses cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
      },
    })

    // Update order with payment intent ID
    await this.ordersService.update(order.id, {
      paymentIntentId: paymentIntent.id,
    })

    return paymentIntent
  }

  /**
   * Handle Stripe webhook events
   * @param event Stripe event
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        // Update order payment status
        await this.ordersService.update(orderId, {
          paymentStatus: PaymentStatus.PAID,
        })
        break
      case "payment_intent.payment_failed":
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent
        const orderIdFailed = paymentIntentFailed.metadata.orderId

        // Update order payment status
        await this.ordersService.update(orderIdFailed, {
          paymentStatus: PaymentStatus.FAILED,
        })
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
  }
}

