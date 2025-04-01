import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import type { UpdatePaymentDto } from "./dto/update-payment.dto"
import type { PrismaService } from "../prisma/prisma.service"
import { PaymentStatus, UserRole } from "@prisma/client"

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    // Verify the order exists and belongs to the user
    const order = await this.prisma.order.findUnique({
      where: { id: createPaymentDto.orderId },
      include: { user: true },
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${createPaymentDto.orderId} not found`)
    }

    if (order.userId !== userId) {
      throw new ForbiddenException("You can only create payments for your own orders")
    }

    // Create the payment
    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        user: { connect: { id: userId } },
      },
    })
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        include: {
          order: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payment.count(),
    ])

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findUserPayments(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          order: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ])

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string, user: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`)
    }

    // Check if the user is authorized to view this payment
    if (user.role !== UserRole.ADMIN && payment.userId !== user.id) {
      throw new ForbiddenException("You can only view your own payments")
    }

    return payment
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    // Check if payment exists
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`)
    }

    // Update payment
    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    })
  }

  async remove(id: string) {
    // Check if payment exists
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`)
    }

    return this.prisma.payment.delete({
      where: { id },
    })
  }

  async processWebhook(webhookData: any) {
    // Process webhook data from payment provider
    // This is a simplified example - in a real application, you would:
    // 1. Verify the webhook signature
    // 2. Parse the webhook data based on the payment provider's format
    // 3. Update the payment status accordingly

    if (!webhookData.paymentId) {
      return { success: false, message: "Invalid webhook data" }
    }

    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: webhookData.paymentId },
      })

      if (!payment) {
        return { success: false, message: "Payment not found" }
      }

      // Update payment status based on webhook data
      const updatedPayment = await this.prisma.payment.update({
        where: { id: webhookData.paymentId },
        data: {
          status:
            webhookData.status === "succeeded"
              ? PaymentStatus.COMPLETED
              : webhookData.status === "failed"
                ? PaymentStatus.FAILED
                : PaymentStatus.PENDING,
          transactionReference: webhookData.transactionId || payment.transactionReference,
        },
      })

      // If payment is completed, update the order status
      if (updatedPayment.status === PaymentStatus.COMPLETED) {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.COMPLETED },
        })
      }

      return { success: true, payment: updatedPayment }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

